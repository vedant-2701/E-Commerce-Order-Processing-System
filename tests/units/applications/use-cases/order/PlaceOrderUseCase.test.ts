import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PlaceOrderDTO } from '../../../../../src/application/dto/PlaceOrderDTO.js';
import { PlaceOrderUseCase } from '../../../../../src/application/use-cases/order/PlaceOrderUseCase.js';
import { IOrderRepository } from '../../../../../src/application/interfaces/repositories/IOrderRepository.js';
import { OrderValidationService } from '../../../../../src/domain/services/order/OrderValidationService.js';
import { OrderPricingService } from '../../../../../src/domain/services/order/OrderPricingService.js';
import { OrderFactory } from '../../../../../src/domain/factories/OrderFactory.js';
import { InventoryService } from '../../../../../src/domain/services/order/InventoryService.js';
import { PaymentService } from '../../../../../src/domain/services/payment/PaymentService.js';
import { NotificationService } from '../../../../../src/infrastructure/notifications/NotificationService.js';
import { DatabaseConnection } from '../../../../../src/infrastructure/database/DatabaseConnection.js';
import { PaymentMethod } from '../../../../../src/domain/enums/PaymentMethod.js';
import { PaymentStatus } from '../../../../../src/domain/enums/PaymentStatus.js';
import { PaymentFailedException } from '../../../../../src/domain/exceptions/PaymentFailedException.js';
import { InsufficientInventoryException } from '../../../../../src/domain/exceptions/InsufficientInventoryException.js';
import { OrderStatus } from '../../../../../src/domain/enums/OrderStatus.js';
import { OrderBuilder } from '../../../../helpers/builders/OrderBuilder.js';
import { MockLogger } from '../../../../helpers/mocks/MockLogger.js';

describe('PlaceOrderUseCase - Transactions', () => {
    let placeOrderUseCase: PlaceOrderUseCase;
    let mockOrderRepository: jest.Mocked<IOrderRepository>;
    let mockOrderValidationService: jest.Mocked<OrderValidationService>;
    let mockOrderPricingService: jest.Mocked<OrderPricingService>;
    let mockOrderFactory: jest.Mocked<OrderFactory>;
    let mockInventoryService: jest.Mocked<InventoryService>;
    let mockPaymentService: jest.Mocked<PaymentService>;
    let mockNotificationService: jest.Mocked<NotificationService>;
    let mockDbConnection: jest.Mocked<DatabaseConnection>;
    let mockLogger: ReturnType<typeof MockLogger.create>;

    const sampleOrderItems = [
        {
            id: 'item-1',
            orderId: '',
            productId: 'product-1',
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 5000,
            subtotal: 10000,
        },
    ];

    const sampleTotals = {
        subtotal: 10000,
        tax: 800,
        shippingCost: 500,
        totalAmount: 11300,
    };

    beforeEach(() => {
        mockOrderRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByOrderNumber: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        mockOrderValidationService = {
            validateAndBuildOrderItems: jest.fn(),
        } as any;

        mockOrderPricingService = {
            calculateTotals: jest.fn(),
        } as any;

        mockOrderFactory = {
            createOrder: jest.fn(),
        } as any;

        mockInventoryService = {
            deductStock: jest.fn(),
        } as any;

        mockPaymentService = {
            processPayment: jest.fn(),
        } as any;

        mockNotificationService = {
            notify: jest.fn(),
        } as any;

        // Mock transaction to execute the callback, simulating real behavior
        mockDbConnection = {
            transaction: jest.fn<any>().mockImplementation(async (callback: Function) => {
                return await callback({});  // pass empty object as tx
            }),
            getClient: jest.fn(),
        } as any;

        mockLogger = MockLogger.create();

        placeOrderUseCase = new PlaceOrderUseCase(
            mockOrderRepository,
            mockOrderValidationService,
            mockOrderPricingService,
            mockOrderFactory,
            mockInventoryService,
            mockPaymentService,
            mockNotificationService,
            mockDbConnection,
            mockLogger,
        );
    });

    const createDto = (overrides?: Partial<PlaceOrderDTO>): PlaceOrderDTO => ({
        userId: 'user-123',
        items: [{ productId: 'product-1', quantity: 2 }],
        shippingAddress: '123 Main St',
        billingAddress: '123 Main St',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDetails: { cardNumber: '4242424242424242' },
        ...overrides,
    });

    describe('payment failure — transaction never starts', () => {
        it('should throw PaymentFailedException and NOT start a transaction', async () => {
            const dto = createDto();
            const order = new OrderBuilder().withUserId(dto.userId).build();

            mockOrderValidationService.validateAndBuildOrderItems.mockResolvedValue(sampleOrderItems);
            mockOrderPricingService.calculateTotals.mockReturnValue(sampleTotals);
            mockOrderFactory.createOrder.mockReturnValue(order);

            // Payment fails (status is FAILED, not CAPTURED)
            mockPaymentService.processPayment.mockResolvedValue({
                id: 'pay-1',
                orderId: order.id,
                amount: order.totalAmount,
                method: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.FAILED,
                failureReason: 'Card declined',
                createdAt: new Date(),
            });

            // Act & Assert
            await expect(placeOrderUseCase.execute(dto)).rejects.toThrow(PaymentFailedException);

            // Transaction was never started because payment failed before it
            expect(mockDbConnection.transaction).not.toHaveBeenCalled();

            // Inventory was never touched
            expect(mockInventoryService.deductStock).not.toHaveBeenCalled();

            // Order was never persisted
            expect(mockOrderRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('transaction rollback — inventory deduction fails', () => {
        it('should rollback order creation when inventory deduction fails', async () => {
            const dto = createDto();
            const order = new OrderBuilder()
                .withUserId(dto.userId)
                .withStatus(OrderStatus.PENDING)
                .build();

            mockOrderValidationService.validateAndBuildOrderItems.mockResolvedValue(sampleOrderItems);
            mockOrderPricingService.calculateTotals.mockReturnValue(sampleTotals);
            mockOrderFactory.createOrder.mockReturnValue(order);

            // Payment succeeds
            mockPaymentService.processPayment.mockResolvedValue({
                id: 'pay-1',
                orderId: order.id,
                amount: order.totalAmount,
                method: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.CAPTURED,
                transactionId: 'txn-abc',
                processedAt: new Date(),
                createdAt: new Date(),
            });

            // Inventory deduction fails inside the transaction (insufficient stock)
            mockInventoryService.deductStock.mockRejectedValue(
                new InsufficientInventoryException('Insufficient stock for product product-1. Requested: 2'),
            );

            // Act & Assert
            await expect(placeOrderUseCase.execute(dto)).rejects.toThrow(InsufficientInventoryException);

            // Transaction WAS started (payment succeeded)
            expect(mockDbConnection.transaction).toHaveBeenCalledTimes(1);

            // Inventory deduction was attempted inside the transaction
            expect(mockInventoryService.deductStock).toHaveBeenCalledWith(dto.items, expect.anything());

            // Order create was NOT called because deductStock threw before it
            expect(mockOrderRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('successful order placement', () => {
        it('should deduct inventory and create order inside a transaction', async () => {
            const dto = createDto();
            const order = new OrderBuilder()
                .withUserId(dto.userId)
                .withStatus(OrderStatus.PENDING)
                .build();
            const savedOrder = { ...order, status: OrderStatus.CONFIRMED };

            mockOrderValidationService.validateAndBuildOrderItems.mockResolvedValue(sampleOrderItems);
            mockOrderPricingService.calculateTotals.mockReturnValue(sampleTotals);
            mockOrderFactory.createOrder.mockReturnValue(order);

            mockPaymentService.processPayment.mockResolvedValue({
                id: 'pay-1',
                orderId: order.id,
                amount: order.totalAmount,
                method: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.CAPTURED,
                transactionId: 'txn-abc',
                processedAt: new Date(),
                createdAt: new Date(),
            });

            mockInventoryService.deductStock.mockResolvedValue(undefined);
            mockOrderRepository.create.mockResolvedValue(savedOrder);
            mockNotificationService.notify.mockResolvedValue(undefined);

            // Act
            const result = await placeOrderUseCase.execute(dto);

            // Assert — correct order of operations
            expect(mockOrderValidationService.validateAndBuildOrderItems).toHaveBeenCalledWith(dto.items);
            expect(mockOrderPricingService.calculateTotals).toHaveBeenCalledWith(sampleOrderItems);
            expect(mockPaymentService.processPayment).toHaveBeenCalled();

            // Transaction was started
            expect(mockDbConnection.transaction).toHaveBeenCalledTimes(1);

            // Both operations happened inside the transaction with a tx context
            expect(mockInventoryService.deductStock).toHaveBeenCalledWith(dto.items, expect.anything());
            expect(mockOrderRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ status: OrderStatus.CONFIRMED }),
                expect.anything(),  // tx context
            );

            // Result is the saved order
            expect(result.status).toBe(OrderStatus.CONFIRMED);
        });

        it('should send notification after successful transaction', async () => {
            const dto = createDto();
            const order = new OrderBuilder().withUserId(dto.userId).build();
            const savedOrder = { ...order, status: OrderStatus.CONFIRMED };

            mockOrderValidationService.validateAndBuildOrderItems.mockResolvedValue(sampleOrderItems);
            mockOrderPricingService.calculateTotals.mockReturnValue(sampleTotals);
            mockOrderFactory.createOrder.mockReturnValue(order);

            mockPaymentService.processPayment.mockResolvedValue({
                id: 'pay-1',
                orderId: order.id,
                amount: order.totalAmount,
                method: PaymentMethod.CREDIT_CARD,
                status: PaymentStatus.CAPTURED,
                transactionId: 'txn-abc',
                processedAt: new Date(),
                createdAt: new Date(),
            });

            mockInventoryService.deductStock.mockResolvedValue(undefined);
            mockOrderRepository.create.mockResolvedValue(savedOrder);
            mockNotificationService.notify.mockResolvedValue(undefined);

            await placeOrderUseCase.execute(dto);

            // Wait for fire-and-forget notification
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(mockNotificationService.notify).toHaveBeenCalledWith(
                'email',
                expect.stringContaining(savedOrder.userId),
                expect.stringContaining(savedOrder.orderNumber),
                expect.any(String),
            );
        });
    });
});
