import { CreateCategoryUseCase } from "@application/use-cases/category/CreateCategoryUseCase.js";
import { GetCategoriesUseCase } from "@application/use-cases/category/GetCategoriesUseCase.js";
import { GetCategoryByIdUseCase } from "@application/use-cases/category/GetCategoryByIdUseCase.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { CategoryRepository } from "@infrastructure/database/repositories/CategoryRepository.js";
import { CategoryController } from "@presentation/controllers/CategoryController.js";
import { container } from "tsyringe";

export function registerCategory(): void {
    // Repositories - Transient
    container.register(DI_TOKENS.ICategoryRepository, {
        useClass: CategoryRepository,
    });

    // Categories Use Cases
    container.registerSingleton<CreateCategoryUseCase>(CreateCategoryUseCase);
    container.registerSingleton<GetCategoriesUseCase>(GetCategoriesUseCase);
    container.registerSingleton<GetCategoryByIdUseCase>(GetCategoryByIdUseCase);

    // Controllers - Singletons
    container.register<CategoryController>(CategoryController, { useClass: CategoryController });
}
