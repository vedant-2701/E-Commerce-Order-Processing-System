import "reflect-metadata";
import { describe, it, expect, beforeAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";
import express, { Router } from "express";
import { container } from "tsyringe";

import { DI_TOKENS } from "../../src/config/di-tokens.js";
import { Logger } from "../../src/infrastructure/logging/Logger.js";
import { MockLogger } from "../helpers/mocks/MockLogger.js";
import { PaymentMethod } from "../../src/domain/enums/PaymentMethod.js";
import { OrderStatus } from "../../src/domain/enums/OrderStatus.js";

// Repositories (real implementations — only DB client is mocked)
import { OrderRepository } from "../../src/infrastructure/database/repositories/OrderRepository.js";
import { ProductRepository } from "../../src/infrastructure/database/repositories/ProductRepository.js";
import { InventoryRepository } from "../../src/infrastructure/database/repositories/InventoryRepository.js";

// Domain services (all real — no mocking)
import { OrderValidationService } from "../../src/domain/services/order/OrderValidationService.js";
import { OrderPricingService } from "../../src/domain/services/order/OrderPricingService.js";
import { OrderFactory } from "../../src/domain/factories/OrderFactory.js";
import { InventoryService } from "../../src/domain/services/order/InventoryService.js";
import { PaymentService } from "../../src/domain/services/payment/PaymentService.js";

// Payment strategies (real — CreditCardPaymentStrategy validates card inline)
import { PaymentProcessorFactory } from "../../src/infrastructure/payment/PaymentProcessorFactory.js";
import { CreditCardPaymentStrategy } from "../../src/infrastructure/payment/strategies/CreditCardPaymentStrategy.js";
import { PayPalPaymentStrategy } from "../../src/infrastructure/payment/strategies/PayPalPaymentStrategy.js";

// Notification strategies (real — fire-and-forget, console.log already mocked in setup.ts)
import { NotificationService } from "../../src/infrastructure/notifications/NotificationService.js";
import { EmailNotificationStrategy } from "../../src/infrastructure/notifications/strategies/EmailNotificationStrategy.js";
import { SmsNotificationStrategy } from "../../src/infrastructure/notifications/strategies/SmsNotificationStrategy.js";

// Use Cases
import { PlaceOrderUseCase } from "../../src/application/use-cases/order/PlaceOrderUseCase.js";
import { GetOrderByIdUseCase } from "../../src/application/use-cases/order/GetOrderByIdUseCase.js";
import { GetOrderHistoryUseCase } from "../../src/application/use-cases/order/GetOrderHistoryUseCase.js";

// Presentation
import { OrderController } from "../../src/presentation/controllers/OrderController.js";
import { ErrorHandler } from "../../src/presentation/middlewares/ErrorHandler.js";
import { orderRoutes } from "../../src/presentation/routes/orderRoutes.js";

const USER_ID    = "a1b2c3d4-e5f6-1890-abcd-ef1234567890";
const PRODUCT_ID = "b2c3d4e5-f6a7-1901-bcde-f12345678901";
const ORDER_ID   = "c3d4e5f6-a7b8-1012-a001-123456789012";

const dbProduct = {
    id: PRODUCT_ID,
    name: "Wireless Headphones",
    description: "High-quality audio headphones",
    price: 5000,
    categoryId: "cat-1",
    imageUrl: null,
    sku: "WH-001",
    isActive: true,
    metadata: {},
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// Full Prisma row returned by order.create / order.findUnique
const dbOrderRow = {
    id: ORDER_ID,
    userId: USER_ID,
    orderNumber: "ORD-TEST-001",
    status: OrderStatus.CONFIRMED,
    subtotal: 10000,
    tax: 800,
    shippingCost: 500,
    totalAmount: 11300,
    shippingAddress: "123 Main Street, City",
    billingAddress: "123 Main Street, City",
    notes: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    items: [
        {
            id: "item-1",
            orderId: ORDER_ID,
            productId: PRODUCT_ID,
            productName: "Wireless Headphones",
            quantity: 2,
            unitPrice: 5000,
            subtotal: 10000,
        },
    ],
    payment: {
        id: "pay-1",
        orderId: ORDER_ID,
        amount: 11300,
        method: PaymentMethod.CREDIT_CARD,
        status: "CAPTURED",
        transactionId: "CC-12345-abc",
        processedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
    },
};

// Central valid request body

const validPlaceOrderBody = {
    userId: USER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 2 }],
    shippingAddress: "123 Main Street, City",
    paymentMethod: PaymentMethod.CREDIT_CARD,
    // Valid card — CreditCardPaymentStrategy.validateCard checks:
    //   cardNumber.length === 16, cvv.length === 3, !!expiryDate
    paymentDetails: {
        cardNumber: "1234567890123456",
        cvv: "123",
        expiryDate: "12/27",
        cardHolderName: "Test User",
    },
};

// Mock Prisma client
// The SAME object is used as both the regular client and the transaction client
// (see mockDbConnection.transaction below) so all Prisma calls — inside and
// outside the transaction — hit the same set of jest.fn() spies.

const mockPrisma = {
    product: {
        findUnique: jest.fn(),
    },
    inventory: {
        findUnique: jest.fn(), // used by getAvailableStock (pre-check)
        updateMany: jest.fn(), // used by atomicDeductStock (inside tx)
    },
    order: {
        create:     jest.fn(),
        findUnique: jest.fn(),
        findMany:   jest.fn(),
    },
};

// DatabaseConnection mock — transaction() runs the callback with mockPrisma as
// the Prisma.TransactionClient, so repositories that accept an optional `tx`
// argument resolve calls against the same in-memory mock.
const mockDbConnection = {
    getClient:   () => mockPrisma,
    transaction: jest.fn<any>(),
    connect:     jest.fn(),
    disconnect:  jest.fn(),
    healthCheck: jest.fn<() => Promise<boolean>>(),
};


let app: Express;

beforeAll(() => {
    container.reset();

    const mockLogger = MockLogger.create();
    // Register under the DI_TOKENS.Logger symbol (used by most services)
    container.register(DI_TOKENS.Logger, { useValue: mockLogger });
    container.register(Logger, { useValue: mockLogger });
    container.register(DI_TOKENS.DatabaseConnection, { useValue: mockDbConnection });

    // Repositories — real production code, mock DB client injected above
    container.register(DI_TOKENS.IProductRepository,  { useClass: ProductRepository });
    container.register(DI_TOKENS.IInventoryRepository, { useClass: InventoryRepository });
    container.register(DI_TOKENS.IOrderRepository,     { useClass: OrderRepository });

    // Domain services — fully real, no mocking
    container.registerSingleton(OrderValidationService);
    container.registerSingleton(OrderPricingService);
    container.registerSingleton(OrderFactory);
    container.registerSingleton(InventoryService);

    // Payment — real strategy; CreditCardPaymentStrategy validates card details
    // inline (no external calls), so payment success/failure is driven purely
    // by the card data we send in each test.
    container.registerSingleton(CreditCardPaymentStrategy);
    container.registerSingleton(PayPalPaymentStrategy);
    container.registerSingleton(PaymentProcessorFactory);
    container.registerSingleton(PaymentService);

    // Notifications — fire-and-forget; console.log is already silenced in
    // tests/setup.ts so these don't pollute test output.
    container.registerSingleton(EmailNotificationStrategy);
    container.registerSingleton(SmsNotificationStrategy);
    container.registerSingleton(NotificationService);

    // Use cases and controllers
    container.registerSingleton(PlaceOrderUseCase);
    container.registerSingleton(GetOrderByIdUseCase);
    container.registerSingleton(GetOrderHistoryUseCase);
    container.register(OrderController, { useClass: OrderController });
    container.registerSingleton(ErrorHandler);

    // Minimal Express app — only order routes wired up
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const api = Router();
    api.use("/orders", orderRoutes);
    app.use("/api", api);

    app.use(container.resolve(ErrorHandler).handle);
});

beforeEach(() => {
    // Transaction: call the callback synchronously with mockPrisma as `tx`.
    // InventoryRepository.atomicDeductStock and OrderRepository.create both
    // accept an optional `tx?: TransactionContext` and fall back to
    // `this.prisma` when tx is absent — passing mockPrisma as tx means the
    // SAME spies answer both transactional and non-transactional calls.
    mockDbConnection.transaction.mockImplementation(
        async (callback: Function) => callback(mockPrisma),
    );
});

// POST /api/orders

describe("POST /api/orders", () => {
    //  Happy path

    it("201 - places order successfully with valid card and available stock", async () => {
        // Step 1 — OrderValidationService reads product + available stock
        mockPrisma.product.findUnique.mockResolvedValue(dbProduct);
        mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 100 });

        // Steps inside transaction:
        //   atomicDeductStock: count:1 means row was updated (sufficient stock)
        mockPrisma.inventory.updateMany.mockResolvedValue({ count: 1 });
        //   OrderRepository.create: returns persisted order
        mockPrisma.order.create.mockResolvedValue(dbOrderRow);

        const res = await request(app)
            .post("/api/orders")
            .send(validPlaceOrderBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Order placed successfully");

        const order = res.body.data;
        expect(order.userId).toBe(USER_ID);
        expect(order.status).toBe(OrderStatus.CONFIRMED);
        expect(order.totalAmount).toBe(11300);
        expect(order.items).toHaveLength(1);
        expect(order.items[0].productId).toBe(PRODUCT_ID);
        expect(order.items[0].quantity).toBe(2);
        expect(order.payment.status).toBe("CAPTURED");
        expect(order.payment.method).toBe(PaymentMethod.CREDIT_CARD);

        // Transaction must have been entered once
        expect(mockDbConnection.transaction).toHaveBeenCalledTimes(1);

        // Both transactional operations were called
        expect(mockPrisma.inventory.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ productId: PRODUCT_ID, quantity: { gte: 2 } }),
                data:  expect.objectContaining({ quantity: { decrement: 2 } }),
            }),
        );
        expect(mockPrisma.order.create).toHaveBeenCalledTimes(1);
    });

    //  Payment failure

    it("402 - returns PAYMENT_FAILED when paymentDetails are omitted", async () => {
        // Validation service still reads product + stock before payment
        mockPrisma.product.findUnique.mockResolvedValue(dbProduct);
        mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 100 });

        const { paymentDetails: _omit, ...bodyWithoutPayment } = validPlaceOrderBody;

        const res = await request(app)
            .post("/api/orders")
            .send(bodyWithoutPayment);

        expect(res.status).toBe(402);
        expect(res.body.error.errorCode).toBe("PAYMENT_FAILED");

        // Transaction was never entered — payment is checked before the critical section
        expect(mockDbConnection.transaction).not.toHaveBeenCalled();
        expect(mockPrisma.order.create).not.toHaveBeenCalled();
        expect(mockPrisma.inventory.updateMany).not.toHaveBeenCalled();
    });

    //  Inventory / validation issues found before payment

    it("400  returns VALIDATION_ERROR when ordered product does not exist", async () => {
        mockPrisma.product.findUnique.mockResolvedValue(null); // product not found

        const res = await request(app)
            .post("/api/orders")
            .send(validPlaceOrderBody);

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        expect(res.body.error.message).toContain(PRODUCT_ID);

        // Payment and transaction never reached
        expect(mockDbConnection.transaction).not.toHaveBeenCalled();
    });

    it("409 - returns INSUFFICIENT_INVENTORY when stock is below requested quantity", async () => {
        mockPrisma.product.findUnique.mockResolvedValue(dbProduct);
        // Only 1 unit available but 2 requested → pre-check in OrderValidationService fails
        mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 1 });

        const res = await request(app)
            .post("/api/orders")
            .send(validPlaceOrderBody);

        expect(res.status).toBe(409);
        expect(res.body.error.errorCode).toBe("INSUFFICIENT_INVENTORY");

        expect(mockDbConnection.transaction).not.toHaveBeenCalled();
    });

    //  Concurrency / oversell scenario

    it("409 - returns INSUFFICIENT_INVENTORY when atomic stock deduction fails inside transaction (oversell guard)", async () => {
        // Pre-check passes (100 available)
        mockPrisma.product.findUnique.mockResolvedValue(dbProduct);
        mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 100 });

        // But between the pre-check and the transaction, another request grabbed the last units.
        // The atomic UPDATE WHERE quantity >= N matched 0 rows → count: 0
        mockPrisma.inventory.updateMany.mockResolvedValue({ count: 0 });

        const res = await request(app)
            .post("/api/orders")
            .send(validPlaceOrderBody);

        expect(res.status).toBe(409);
        expect(res.body.error.errorCode).toBe("INSUFFICIENT_INVENTORY");

        // Transaction WAS entered (payment had succeeded)
        expect(mockDbConnection.transaction).toHaveBeenCalledTimes(1);

        // atomicDeductStock was called but order was never persisted
        expect(mockPrisma.inventory.updateMany).toHaveBeenCalledTimes(1);
        expect(mockPrisma.order.create).not.toHaveBeenCalled();
    });

    //  Request validation (Zod schema)

    it("400 - VALIDATION_ERROR when userId is missing", async () => {
        const { userId: _omit, ...noUserId } = validPlaceOrderBody;

        const res = await request(app)
            .post("/api/orders")
            .send(noUserId);

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when userId is not a valid UUID", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({ ...validPlaceOrderBody, userId: "not-a-uuid" });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when items array is empty", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({ ...validPlaceOrderBody, items: [] });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when productId in items is not a valid UUID", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({
                ...validPlaceOrderBody,
                items: [{ productId: "bad-product-id", quantity: 1 }],
            });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when item quantity is 0 (below minimum of 1)", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({
                ...validPlaceOrderBody,
                items: [{ productId: PRODUCT_ID, quantity: 0 }],
            });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when shippingAddress is shorter than 10 characters", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({ ...validPlaceOrderBody, shippingAddress: "Short St" });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });

    it("400 - VALIDATION_ERROR when paymentMethod is not a recognised enum value", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({ ...validPlaceOrderBody, paymentMethod: "BITCOIN" });

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });
});

// GET /api/orders/:orderId

describe("GET /api/orders/:orderId", () => {
    it("200 - returns the order when found", async () => {
        mockPrisma.order.findUnique.mockResolvedValue(dbOrderRow);

        const res = await request(app).get(`/api/orders/${ORDER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(ORDER_ID);
        expect(res.body.data.userId).toBe(USER_ID);
        expect(res.body.data.status).toBe(OrderStatus.CONFIRMED);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.payment.status).toBe("CAPTURED");
    });

    it("404 - returns NOT_FOUND when the order does not exist", async () => {
        mockPrisma.order.findUnique.mockResolvedValue(null);

        const res = await request(app).get(`/api/orders/${ORDER_ID}`);

        expect(res.status).toBe(404);
        expect(res.body.error.errorCode).toBe("NOT_FOUND");
        expect(res.body.error.message).toContain(ORDER_ID);
    });

    it("400 - VALIDATION_ERROR when orderId is not a valid UUID", async () => {
        const res = await request(app).get("/api/orders/not-a-uuid");

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });
});

// GET /api/orders/history/:userId

describe("GET /api/orders/history/:userId", () => {
    it("200 - returns order history for a user", async () => {
        mockPrisma.order.findMany.mockResolvedValue([dbOrderRow]);

        const res = await request(app).get(`/api/orders/history/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);

        const order = res.body.data[0];
        expect(order.orderNumber).toBe("ORD-TEST-001");
        expect(order.status).toBe(OrderStatus.CONFIRMED);
        expect(order.totalAmount).toBe(11300);
        expect(order.items[0].productName).toBe("Wireless Headphones");
    });

    it("200 - returns empty array when user has no orders", async () => {
        mockPrisma.order.findMany.mockResolvedValue([]);

        const res = await request(app).get(`/api/orders/history/${USER_ID}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    });

    it("200 - respects the limit query parameter", async () => {
        mockPrisma.order.findMany.mockResolvedValue([dbOrderRow]);

        const res = await request(app)
            .get(`/api/orders/history/${USER_ID}`)
            .query({ limit: 5 });

        expect(res.status).toBe(200);
        expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 5 }),
        );
    });

    it("400 - VALIDATION_ERROR when userId path param is not a valid UUID", async () => {
        const res = await request(app).get("/api/orders/history/not-a-uuid");

        expect(res.status).toBe(400);
        expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
    });
});
