import { CreateProductUseCase } from "@application/use-cases/product/CreateProductUseCase.js";
import { GetProductByIdUseCase } from "@application/use-cases/product/GetProductByIdUseCase.js";
import { GetProductsUseCase } from "@application/use-cases/product/GetProductsUseCase.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { InventoryRepository } from "@infrastructure/database/repositories/InventoryRepository.js";
import { ProductRepository } from "@infrastructure/database/repositories/ProductRepository.js";
import { ProductController } from "@presentation/controllers/ProductController.js";
import { container } from "tsyringe";

export function registerProduct() {
    // Repositories - Transient
    container.register(DI_TOKENS.IProductRepository, {
        useClass: ProductRepository,
    });
    container.register(DI_TOKENS.IInventoryRepository, {
        useClass: InventoryRepository,
    });

    // Products Use Cases
    container.registerSingleton<CreateProductUseCase>(CreateProductUseCase);
    container.registerSingleton<GetProductsUseCase>(GetProductsUseCase);
    container.registerSingleton<GetProductByIdUseCase>(GetProductByIdUseCase);

    // Controllers - Singletons
    container.registerSingleton<ProductController>(ProductController);
}
