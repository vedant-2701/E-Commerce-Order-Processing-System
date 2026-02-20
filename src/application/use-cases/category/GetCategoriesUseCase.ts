import { singleton, inject } from "tsyringe";
import { DI_TOKENS } from "@config/di-tokens.js";
import type { ICategoryRepository } from "../../interfaces/repositories/ICategoryRepository.js";
import { CategoryResponseDTO } from "../../dto/CategoryDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { CategoryMapper } from "../../mappers/CategoryMapper.js";

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

        /*  N + 1 Queries - bcz we need to fetch product count for each category.
         * To optimize, we can fetch product counts in bulk for all category IDs and map them.
         * This reduces the number of queries from N+1 to 2.
        const enrichedCategories = await Promise.all(
            categories.map(async (category) => {
                const productCount =
                    await this.categoryRepository.getProductCount(category.id);

                return {
                    id: category.id,
                    name: category.name,
                    description: category.description ?? undefined,
                    productCount,
                    createdAt: category.createdAt,
                };
            }),
        ); */

        const categoryIds = categories.map((c) => c.id);
        const productCounts = await this.categoryRepository.getProductCounts(
            categoryIds,
        );

        return categories.map((category) =>
            CategoryMapper.toResponseDTO(category, productCounts.get(category.id) ?? 0),
        );
    }
}
