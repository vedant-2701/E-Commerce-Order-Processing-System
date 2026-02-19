import "reflect-metadata";
import express, { Router } from "express";
import { container } from "tsyringe";
import { jest } from "@jest/globals";

import { DI_TOKENS } from "../../../src/config/di-tokens.js";
import { MockLogger } from "../../helpers/mocks/MockLogger.js";

// Repositories
import { CategoryRepository } from "../../../src/infrastructure/database/repositories/CategoryRepository.js";
import { ProductRepository } from "../../../src/infrastructure/database/repositories/ProductRepository.js";
import { InventoryRepository } from "../../../src/infrastructure/database/repositories/InventoryRepository.js";

// Use Cases – Category
import { CreateCategoryUseCase } from "../../../src/application/use-cases/category/CreateCategoryUseCase.js";
import { GetCategoriesUseCase } from "../../../src/application/use-cases/category/GetCategoriesUseCase.js";
import { GetCategoryByIdUseCase } from "../../../src/application/use-cases/category/GetCategoryByIdUseCase.js";

// Use Cases – Product
import { CreateProductUseCase } from "../../../src/application/use-cases/product/CreateProductUseCase.js";
import { GetProductsUseCase } from "../../../src/application/use-cases/product/GetProductsUseCase.js";
import { GetProductByIdUseCase } from "../../../src/application/use-cases/product/GetProductByIdUseCase.js";

// Controllers
import { CategoryController } from "../../../src/presentation/controllers/CategoryController.js";
import { ProductController } from "../../../src/presentation/controllers/ProductController.js";

// Middleware / Routes
import { ErrorHandler } from "../../../src/presentation/middlewares/ErrorHandler.js";
import { categoryRoutes } from "../../../src/presentation/routes/categoryRoutes.js";
import { productRoutes } from "../../../src/presentation/routes/productRoutes.js";

/**
 * Builds a lightweight Express app wired against a mock Prisma client.
 * Every layer from HTTP → Controller → UseCase → Repository is REAL
 * production code; only the database calls are intercepted via the
 * mock Prisma client.
 */
export function createTestApp(mockPrisma: Record<string, unknown>) {
    //  Reset the container so each test file gets a clean slate 
    container.reset();

    //  Infrastructure mocks 
    const mockLogger = MockLogger.create();

    const mockDbConnection = {
        getClient: () => mockPrisma,
        connect: jest.fn(),
        disconnect: jest.fn(),
        healthCheck: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    };

    container.register(DI_TOKENS.Logger, { useValue: mockLogger });
    container.register(DI_TOKENS.DatabaseConnection, {
        useValue: mockDbConnection,
    });

    //  Repositories (real implementation, mock DB client) 
    container.register(DI_TOKENS.ICategoryRepository, {
        useClass: CategoryRepository,
    });
    container.register(DI_TOKENS.IProductRepository, {
        useClass: ProductRepository,
    });
    container.register(DI_TOKENS.IInventoryRepository, {
        useClass: InventoryRepository,
    });

    //  Use Cases 
    container.registerSingleton(CreateCategoryUseCase);
    container.registerSingleton(GetCategoriesUseCase);
    container.registerSingleton(GetCategoryByIdUseCase);

    container.registerSingleton(CreateProductUseCase);
    container.registerSingleton(GetProductsUseCase);
    container.registerSingleton(GetProductByIdUseCase);

    //  Controllers 
    container.register(CategoryController, { useClass: CategoryController });
    container.register(ProductController, { useClass: ProductController });

    //  Error Handler 
    container.registerSingleton(ErrorHandler);

    //  Express app 
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const apiRouter = Router();
    apiRouter.use("/categories", categoryRoutes);
    apiRouter.use("/products", productRoutes);
    app.use("/api", apiRouter);

    // Wire up the real error handler so domain/validation errors map to the
    // correct HTTP status codes.
    const errorHandler = container.resolve(ErrorHandler);
    app.use(errorHandler.handle);

    return app;
}
