import { singleton, inject } from "tsyringe";
import { DI_TOKENS } from "@config/di-tokens.js";
import type { ICategoryRepository } from "../../interfaces/repositories/ICategoryRepository.js";
import { Category } from "@domain/entities/Category.js";
import { NotFoundError } from "@shared/errors/NotFoundError.js";
import { Logger } from "@infrastructure/logging/Logger.js";

@singleton()
export class GetCategoryByIdUseCase {
    constructor(
        @inject(DI_TOKENS.ICategoryRepository)
        private readonly categoryRepository: ICategoryRepository,

        @inject(DI_TOKENS.Logger) 
        private readonly logger: Logger,
    ) {}

    async execute(categoryId: string): Promise<Category> {
        this.logger.info("Fetching category by ID", { categoryId });

        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
            throw new NotFoundError("Category", categoryId);
        }

        return category;
    }
}
