import "reflect-metadata";
import { describe, it, expect, beforeAll, jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";

import { createTestApp } from "./helpers/createTestApp.js";

// Test fixtures

const PRODUCT_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";   
const CATEGORY_ID = "c3d4e5f6-a7b8-1012-a001-123456789012"; 
const INVENTORY_ID = "d4e5f6a7-b8c9-2345-8001-234567890123"; 

const dbProduct = {
    id: PRODUCT_ID,
    name: "Wireless Headphones",
    description: "High-quality audio headphones",
    price: 9999,
    categoryId: CATEGORY_ID,
    imageUrl: null,
    sku: "WH-XM5-001",
    isActive: true,
    metadata: {},
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const dbInventory = {
    id: INVENTORY_ID,
    productId: PRODUCT_ID,
    quantity: 50,
    minStockLevel: 10,
    lastRestockDate: null,
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const validCreateProductBody = {
    name: "Wireless Headphones",
    description: "High-quality audio headphones",
    price: 9999,
    categoryId: CATEGORY_ID,
    sku: "WH-XM5-001",
    initialStock: 50,
};

// Mock Prisma client

const mockPrisma = {
    product: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    inventory: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

// Suite setup

let app: Express;

beforeAll(() => {
    app = createTestApp(mockPrisma as any);
});

// Product integration tests

describe("Product API – integration", () => {
    // GET /api/product

    describe("GET /api/products", () => {
        it("returns 200 with an empty list when no products exist", async () => {
            mockPrisma.product.findMany.mockResolvedValue([]);

            const res = await request(app).get("/api/products");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it("returns 200 with all products including available stock", async () => {
            mockPrisma.product.findMany.mockResolvedValue([dbProduct]);
            mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 50 });

            const res = await request(app).get("/api/products");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);

            const product = res.body.data[0];
            expect(product.id).toBe(PRODUCT_ID);
            expect(product.name).toBe("Wireless Headphones");
            expect(product.price).toBe(9999);
            expect(product.sku).toBe("WH-XM5-001");
            expect(product.availableStock).toBe(50);
        });

        it("returns 200 filtered by categoryId query param", async () => {
            mockPrisma.product.findMany.mockResolvedValue([dbProduct]);
            mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 50 });

            const res = await request(app)
                .get("/api/products")
                .query({ categoryId: CATEGORY_ID });

            expect(res.status).toBe(200);
            expect(res.body.data[0].categoryId).toBe(CATEGORY_ID);

            // Verify the repository received the categoryId filter
            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ categoryId: CATEGORY_ID }),
                }),
            );
        });

        it("returns 400 when categoryId query param is not a valid UUID", async () => {
            const res = await request(app)
                .get("/api/products")
                .query({ categoryId: "bad-id" });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });
    });

    // GET /api/products/:productId

    describe("GET /api/products/:productId", () => {
        it("returns 200 with the product when found", async () => {
            mockPrisma.product.findUnique.mockResolvedValue(dbProduct);
            mockPrisma.inventory.findUnique.mockResolvedValue({ quantity: 50 });

            const res = await request(app).get(`/api/products/${PRODUCT_ID}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(PRODUCT_ID);
            expect(res.body.data.name).toBe("Wireless Headphones");
            expect(res.body.data.availableStock).toBe(50);
        });

        it("returns 404 when the product does not exist", async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);

            const res = await request(app).get(`/api/products/${PRODUCT_ID}`);

            expect(res.status).toBe(404);
            expect(res.body.error.errorCode).toBe("NOT_FOUND");
            expect(res.body.error.message).toContain(PRODUCT_ID);
        });

        it("returns 400 when the productId is not a valid UUID", async () => {
            const res = await request(app).get("/api/products/not-a-uuid");

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });
    });

    // POST /api/products─

    describe("POST /api/products", () => {
        it("returns 201 and the created product on success", async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null); // no duplicate SKU
            mockPrisma.product.create.mockResolvedValue(dbProduct);
            mockPrisma.inventory.create.mockResolvedValue(dbInventory);

            const res = await request(app)
                .post("/api/products")
                .send(validCreateProductBody);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe("Wireless Headphones");
            expect(res.body.data.sku).toBe("WH-XM5-001");
            expect(res.body.data.price).toBe(9999);
            expect(res.body.message).toBe("Product created successfully");
        });

        it("returns 400 when the SKU already exists", async () => {
            // SKU already taken
            mockPrisma.product.findUnique.mockResolvedValue(dbProduct);

            const res = await request(app)
                .post("/api/products")
                .send(validCreateProductBody);

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
            expect(res.body.error.message).toContain("WH-XM5-001");
        });

        it("returns 400 when required fields are missing", async () => {
            const res = await request(app)
                .post("/api/products")
                .send({ name: "Incomplete Product" }); // missing description, price, etc.

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });

        it("returns 400 when price is zero or negative", async () => {
            const res = await request(app)
                .post("/api/products")
                .send({ ...validCreateProductBody, price: 0 });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });

        it("returns 400 when categoryId is not a valid UUID", async () => {
            const res = await request(app)
                .post("/api/products")
                .send({ ...validCreateProductBody, categoryId: "not-a-uuid" });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });
    });
});
