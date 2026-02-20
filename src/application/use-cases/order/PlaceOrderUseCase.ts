import { singleton, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import { PlaceOrderDTO } from '../../dto/PlaceOrderDTO.js';
import { Order } from '@domain/entities/Order.js';
import { PaymentStatus } from '@domain/enums/PaymentStatus.js';
import { OrderStatus } from '@domain/enums/OrderStatus.js';
import type { IOrderRepository } from '../../interfaces/repositories/IOrderRepository.js';
import { OrderValidationService } from '@domain/services/order/OrderValidationService.js';
import { OrderPricingService } from '@domain/services/order/OrderPricingService.js';
import { OrderFactory } from '@domain/factories/OrderFactory.js';
import { InventoryService } from '@domain/services/order/InventoryService.js';
import { PaymentService } from '@domain/services/payment/PaymentService.js';
import { NotificationService } from '@infrastructure/notifications/NotificationService.js';
import { PaymentFailedException } from '@domain/exceptions/PaymentFailedException.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { DatabaseConnection } from '@infrastructure/database/DatabaseConnection.js';
import type { IUserRepository } from '@application/interfaces/repositories/IUserRepository.js';

@singleton()
export class PlaceOrderUseCase {
    constructor(
        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,

        @inject(DI_TOKENS.IUserRepository)
        private readonly userRepository: IUserRepository,

        @inject(OrderValidationService)
        private readonly orderValidationService: OrderValidationService,

        @inject(OrderPricingService)
        private readonly orderPricingService: OrderPricingService,

        @inject(OrderFactory)
        private readonly orderFactory: OrderFactory,

        @inject(InventoryService)
        private readonly inventoryService: InventoryService,

        @inject(PaymentService)
        private readonly paymentService: PaymentService,

        @inject(NotificationService)
        private readonly notificationService: NotificationService,

        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(dto: PlaceOrderDTO): Promise<Order> {
        this.logger.info('Starting order placement', { userId: dto.userId });

        // Validate products + stock (READ-only, outside transaction)
        const orderItems = await this.orderValidationService.validateAndBuildOrderItems(dto.items);

        // Calculate pricing (pure computation, no DB)
        const totals = this.orderPricingService.calculateTotals(orderItems);

        // Create order entity (in-memory)
        const order = this.orderFactory.createOrder(dto, orderItems, totals);

        // Process payment (external API call, outside transaction)
        const payment = await this.paymentService.processPayment(order, dto);
        order.payment = payment;

        if (payment.status !== PaymentStatus.CAPTURED) {
            throw new PaymentFailedException(
                'Payment was not successful',
                payment.failureReason
            );
        }

        order.status = OrderStatus.CONFIRMED;

        // CRITICAL SECTION — atomic inventory deduction + order persist
        // Both operations share one transaction: if either fails, both roll back
        const savedOrder = await this.dbConnection.transaction(async (tx) => {
            // Atomic decrement: UPDATE ... WHERE quantity >= N
            // Prevents overselling even with concurrent requests
            await this.inventoryService.deductStock(dto.items, tx);

            // Persist order + items + payment in same transaction
            const saved = await this.orderRepository.create(order, tx);

            return saved;
        });

        // Send notification (fire-and-forget, outside transaction)
        this.notifyUser(savedOrder).catch(err => {
            this.logger.error('Failed to send order notifications', err);
        });

        this.logger.info('Order placed successfully', {
            orderId: savedOrder.id,
            orderNumber: savedOrder.orderNumber,
        });

        return savedOrder;
    }

    private async notifyUser(order: Order): Promise<void> {
        const user = await this.userRepository.findById(order.userId);
        if (!user) {
            this.logger.warn('User not found for order notification', { userId: order.userId });
            return;
        }
        
        const userEmail = user.email;
        const subject = `Order Confirmation - ${order.orderNumber}`;
        const message = `Your order ${order.orderNumber} has been confirmed. Total: $${(
            order.totalAmount / 100
        ).toFixed(2)}`;

        await this.notificationService.notify('email', userEmail, subject, message);
    }
}