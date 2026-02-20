import "reflect-metadata";
import { describe, it, expect, beforeAll, jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";

import { createTestApp } from "./helpers/createTestApp.js";


const CATEGORY_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const dbCategory = {
    id: CATEGORY_ID,
    name: "Electronics",
    description: "Electronic gadgets",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// Mock Prisma client 

const mockPrisma = {
    category: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    product: {
        count: jest.fn(),
    },
};

//  Suite setup 

let app: Express;

beforeAll(() => {
    app = createTestApp(mockPrisma as any);
});

//  Category integration tests 

describe("Category API - integration", () => {
    //  GET /api/categories 

    describe("GET /api/categories", () => {
        it("returns 200 with an empty list when no categories exist", async () => {
            mockPrisma.category.findMany.mockResolvedValue([]);
            mockPrisma.product.count.mockResolvedValue(0);

            const res = await request(app).get("/api/categories");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it("returns 200 with all categories including product count", async () => {
            mockPrisma.category.findMany.mockResolvedValue([dbCategory]);
            mockPrisma.product.count.mockResolvedValue(5);

            const res = await request(app).get("/api/categories");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);

            const category = res.body.data[0];
            expect(category.id).toBe(CATEGORY_ID);
            expect(category.name).toBe("Electronics");
            expect(category.description).toBe("Electronic gadgets");
            expect(category.productCount).toBe(5);
        });
    });

    //  GET /api/categories/:categoryId 

    describe("GET /api/categories/:categoryId", () => {
        it("returns 200 with the category when found", async () => {
            mockPrisma.category.findUnique.mockResolvedValue(dbCategory);

            const res = await request(app).get(`/api/categories/${CATEGORY_ID}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(CATEGORY_ID);
            expect(res.body.data.name).toBe("Electronics");
        });

        it("returns 404 when the category does not exist", async () => {
            mockPrisma.category.findUnique.mockResolvedValue(null);

            const res = await request(app).get(`/api/categories/${CATEGORY_ID}`);

            expect(res.status).toBe(404);
            expect(res.body.error.errorCode).toBe("NOT_FOUND");
            expect(res.body.error.message).toContain(CATEGORY_ID);
        });

        it("returns 400 when the categoryId is not a valid UUID", async () => {
            const res = await request(app).get("/api/categories/not-a-valid-uuid");

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });
    });

    //  POST /api/categories 

    describe("POST /api/categories", () => {
        it("returns 201 and the created category on success", async () => {
            // No existing category with this name
            mockPrisma.category.findFirst.mockResolvedValue(null);
            mockPrisma.category.create.mockResolvedValue(dbCategory);

            const res = await request(app)
                .post("/api/categories")
                .send({ name: "Electronics", description: "Electronic gadgets" });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(CATEGORY_ID);
            expect(res.body.data.name).toBe("Electronics");
            expect(res.body.message).toBe("Category created successfully");
        });

        it("returns 400 when a category with the same name already exists", async () => {
            // Simulate duplicate name
            mockPrisma.category.findFirst.mockResolvedValue(dbCategory);

            const res = await request(app)
                .post("/api/categories")
                .send({ name: "Electronics" });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
            expect(res.body.error.message).toContain("Electronics");
        });

        it("returns 400 when the request body is missing the name field", async () => {
            const res = await request(app)
                .post("/api/categories")
                .send({ description: "No name provided" });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });

        it("returns 400 when the name is too short (< 2 characters)", async () => {
            const res = await request(app)
                .post("/api/categories")
                .send({ name: "A" });

            expect(res.status).toBe(400);
            expect(res.body.error.errorCode).toBe("VALIDATION_ERROR");
        });
    });
});
