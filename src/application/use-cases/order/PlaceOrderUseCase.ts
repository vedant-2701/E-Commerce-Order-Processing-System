import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import { PlaceOrderDTO } from '../../dto/PlaceOrderDTO.js';
import { Order } from '../../../domain/entities/Order.js';
import { PaymentStatus } from '../../../domain/enums/PaymentStatus.js';
import { OrderStatus } from '../../../domain/enums/OrderStatus.js';
import type { IOrderRepository } from '../../interfaces/repositories/IOrderRepository.js';
import { OrderValidationService } from '../../../domain/services/order/OrderValidationService.js';
import { OrderPricingService } from '../../../domain/services/order/OrderPricingService.js';
import { OrderFactory } from '../../../domain/factories/OrderFactory.js';
import { InventoryService } from '../../../domain/services/order/InventoryService.js';
import { PaymentService } from '../../../domain/services/payment/PaymentService.js';
import { NotificationService } from '../../../infrastructure/notifications/NotificationService.js';
import { PaymentFailedException } from '../../../domain/exceptions/PaymentFailedException.js';
import { Logger } from '../../../infrastructure/logging/Logger.js';

@injectable()
export class PlaceOrderUseCase {
    constructor(
        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,

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

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(dto: PlaceOrderDTO): Promise<Order> {
        this.logger.info('Starting order placement', { userId: dto.userId });

        // Validate products + stock, build items
        const orderItems = await this.orderValidationService.validateAndBuildOrderItems(dto.items);

        // Calculate pricing
        const totals = this.orderPricingService.calculateTotals(orderItems);

        // Create order entity
        const order = this.orderFactory.createOrder(dto, orderItems, totals);

        // Process payment
        const payment = await this.paymentService.processPayment(order, dto);
        order.payment = payment;

        // Check payment result
        if (payment.status !== PaymentStatus.CAPTURED) {
            throw new PaymentFailedException(
                'Payment was not successful',
                payment.failureReason
            );
        }

        // Deduct inventory
        await this.inventoryService.deductStock(dto.items);

        // Confirm order
        order.status = OrderStatus.CONFIRMED;

        // Persist order
        const savedOrder = await this.orderRepository.create(order);

        //  Notify user (async, fire and forget)
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
        const userEmail = `user-${order.userId}@example.com`;
        const subject = `Order Confirmation - ${order.orderNumber}`;
        const message = `Your order ${order.orderNumber} has been confirmed. Total: $${(
            order.totalAmount / 100
        ).toFixed(2)}`;

        await this.notificationService.notify('email', userEmail, subject, message);
    }
}