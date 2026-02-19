import { singleton, inject } from "tsyringe";
import { DI_TOKENS } from "@config/di-tokens.js";
import type { ICategoryRepository } from "../../interfaces/repositories/ICategoryRepository.js";
import { CategoryResponseDTO } from "../../dto/CategoryDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";

@singleton()
export class GetCategoriesUseCase {
    constructor(
        @inject(DI_TOKENS.ICategoryRepository)
        private readonly categoryRepository: ICategoryRepository,

        @inject(DI_TOKENS.Logger) 
        private readonly logger: Logger,
    ) {}

    async execute(): Promise<CategoryResponseDTO[]> {
        this.logger.info("Fetching all categories");

        const categories = await this.categoryRepository.findAll();

        const enrichedCategories = await Promise.all(
            categories.map(async (category) => {
                const productCount =
                    await this.categoryRepository.getProductCount(category.id);

                return {
                    id: category.id,
                    name: category.name,
                    description: category.description ?? "No Description",
                    productCount,
                    createdAt: category.createdAt,
                };
            }),
        );

        return enrichedCategories;
    }
}
