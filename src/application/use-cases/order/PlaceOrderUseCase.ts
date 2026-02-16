// application/use-cases/order/PlaceOrderUseCase.ts
import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { DI_TOKENS } from "@config/di-tokens.js";
import { PlaceOrderDTO } from "../../dto/PlaceOrderDTO.js";
import { Order } from "../../../domain/entities/Order.js";
import { OrderItem } from "../../../domain/entities/OrderItem.js";
import { Payment } from "../../../domain/entities/Payment.js";
import { OrderStatus } from "../../../domain/enums/OrderStatus.js";
import { PaymentStatus } from "../../../domain/enums/PaymentStatus.js";
import type { IOrderRepository } from "../../interfaces/repositories/IOrderRepository.js";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import type { IInventoryRepository } from "../../interfaces/repositories/IInventoryRepository.js";
import { PaymentProcessorFactory } from "../../../infrastructure/payment/PaymentProcessorFactory.js";
import { NotificationService } from "../../../infrastructure/notifications/NotificationService.js";
import { ValidationError } from "../../../shared/errors/ValidationError.js";
import { InsufficientInventoryException } from "../../../domain/exceptions/InsufficientInventoryException.js";
import { PaymentFailedException } from "../../../domain/exceptions/PaymentFailedException.js";
import { Logger } from "../../../infrastructure/logging/Logger.js";

@injectable()
export class PlaceOrderUseCase {
    constructor(
        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,

        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(PaymentProcessorFactory)
        private readonly paymentProcessorFactory: PaymentProcessorFactory,

        @inject(NotificationService)
        private readonly notificationService: NotificationService,

        @inject(DI_TOKENS.Logger) 
        private readonly logger: Logger,
    ) {}

    async execute(dto: PlaceOrderDTO): Promise<Order> {
        this.logger.info("Starting order placement process", {
            userId: dto.userId,
        });

        this.validateInput(dto);

        const orderItems = await this.validateAndPrepareOrderItems(dto.items);

        const { subtotal, tax, shippingCost, totalAmount } =
            this.calculateOrderTotals(orderItems);

        const order = this.createOrderEntity(
            dto,
            orderItems,
            subtotal,
            tax,
            shippingCost,
            totalAmount,
        );

        const payment = await this.processPayment(order, dto);
        order.payment = payment;

        if (payment.status !== PaymentStatus.CAPTURED) {
            throw new PaymentFailedException(
                "Payment was not successful",
                payment.failureReason,
            );
        }

        await this.deductInventory(dto.items);

        order.status = OrderStatus.CONFIRMED;

        const savedOrder = await this.orderRepository.create(order);

        this.sendOrderConfirmationNotifications(savedOrder, dto.userId).catch(
            (err) => {
                this.logger.error("Failed to send order notifications", err);
            },
        );

        this.logger.info("Order placed successfully", {
            orderId: savedOrder.id,
            orderNumber: savedOrder.orderNumber,
        });

        return savedOrder;
    }

    private validateInput(dto: PlaceOrderDTO): void {
        if (!dto.userId) {
            throw new ValidationError("User ID is required");
        }

        if (!dto.items || dto.items.length === 0) {
            throw new ValidationError("Order must contain at least one item");
        }

        if (!dto.shippingAddress || dto.shippingAddress.trim().length === 0) {
            throw new ValidationError("Shipping address is required");
        }

        if (!dto.paymentMethod) {
            throw new ValidationError("Payment method is required");
        }

        for (const item of dto.items) {
            if (!item.productId) {
                throw new ValidationError(
                    "Product ID is required for all items",
                );
            }
            if (item.quantity <= 0) {
                throw new ValidationError("Quantity must be greater than 0");
            }
            if (item.quantity > 100) {
                throw new ValidationError(
                    "Quantity cannot exceed 100 per item",
                );
            }
        }
    }

    private async validateAndPrepareOrderItems(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<OrderItem[]> {
        const orderItems: OrderItem[] = [];

        for (const item of items) {
            const product = await this.productRepository.findById(
                item.productId,
            );
            if (!product) {
                throw new ValidationError(
                    `Product ${item.productId} not found`,
                );
            }

            if (!product.isActive) {
                throw new ValidationError(
                    `Product ${product.name} is no longer available`,
                );
            }

            const availableStock =
                await this.inventoryRepository.getAvailableStock(
                    item.productId,
                );
            if (availableStock < item.quantity) {
                throw new InsufficientInventoryException(
                    `Insufficient inventory for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
                );
            }

            const orderItem: OrderItem = {
                id: uuidv4(),
                orderId: "",
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal: product.price * item.quantity,
            };

            orderItems.push(orderItem);
        }

        return orderItems;
    }

    private calculateOrderTotals(orderItems: OrderItem[]): {
        subtotal: number;
        tax: number;
        shippingCost: number;
        totalAmount: number;
    } {
        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0,
        );
        const tax = Math.round(subtotal * 0.08);
        const shippingCost = subtotal > 5000 ? 0 : 500;
        const totalAmount = subtotal + tax + shippingCost;

        return { subtotal, tax, shippingCost, totalAmount };
    }

    private createOrderEntity(
        dto: PlaceOrderDTO,
        orderItems: OrderItem[],
        subtotal: number,
        tax: number,
        shippingCost: number,
        totalAmount: number,
    ): Order {
        const orderId = uuidv4();
        const orderNumber = this.generateOrderNumber();

        orderItems.forEach((item) => {
            item.orderId = orderId;
        });

        const order: Order = {
            id: orderId,
            userId: dto.userId,
            orderNumber,
            status: OrderStatus.PENDING,
            subtotal,
            tax,
            shippingCost,
            totalAmount,
            shippingAddress: dto.shippingAddress,
            billingAddress: dto.billingAddress,
            items: orderItems,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return order;
    }

    private generateOrderNumber(): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }

    private async processPayment(
        order: Order,
        dto: PlaceOrderDTO,
    ): Promise<Payment> {
        this.logger.info("Processing payment", {
            orderId: order.id,
            method: dto.paymentMethod,
        });

        const paymentProcessor = this.paymentProcessorFactory.getProcessor(
            dto.paymentMethod,
        );

        const payment: Payment = {
            id: uuidv4(),
            orderId: order.id,
            amount: order.totalAmount,
            method: dto.paymentMethod,
            status: PaymentStatus.PENDING,
            createdAt: new Date(),
        };

        try {
            const result = await paymentProcessor.processPayment(
                order.totalAmount,
                "USD",
                dto.paymentDetails,
            );

            if (result.success) {
                payment.status = PaymentStatus.CAPTURED;
                payment.transactionId = result.transactionId!;
                payment.processedAt = new Date();
            } else {
                payment.status = PaymentStatus.FAILED;
                payment.failureReason = result.errorMessage ?? "Payment failed without specific error message";
            }

            return payment;
        } catch (error) {
            this.logger.error("Payment processing error", error);
            payment.status = PaymentStatus.FAILED;
            payment.failureReason =
                error instanceof Error ? error.message : "Unknown error";
            return payment;
        }
    }

    private async deductInventory(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<void> {
        for (const item of items) {
            const inventory = await this.inventoryRepository.findByProductId(
                item.productId,
            );
            if (inventory) {
                inventory.quantity -= item.quantity;
                await this.inventoryRepository.update(inventory);
                this.logger.info("Inventory deducted", {
                    productId: item.productId,
                    quantity: item.quantity,
                });
            }
        }
    }

    private async sendOrderConfirmationNotifications(
        order: Order,
        userId: string,
    ): Promise<void> {
        const userEmail = `user-${userId}@example.com`;

        const subject = `Order Confirmation - ${order.orderNumber}`;
        const message = `Your order ${order.orderNumber} has been confirmed. Total: $${(
            order.totalAmount / 100
        ).toFixed(2)}`;

        await this.notificationService.notify(
            "email",
            userEmail,
            subject,
            message,
        );
    }
}
