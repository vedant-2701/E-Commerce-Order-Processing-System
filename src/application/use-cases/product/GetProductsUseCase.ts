import { singleton, inject } from "tsyringe";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import type { IInventoryRepository } from "../../interfaces/repositories/IInventoryRepository.js";
import { ProductResponseDTO } from "../../dto/ProductDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { ProductMapper } from "../../mappers/ProductMapper.js";

@singleton()
export class GetProductsUseCase {
    constructor(
        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(filters?: {
        categoryId?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<ProductResponseDTO[]> {
        this.logger.info("Fetching products", filters);

        const products = await this.productRepository.findAll(filters);

        /* N + 1 Queries - bcz we need to fetch inventory for each product to get available stock.
         * To optimize, we can fetch inventory in bulk for all product IDs and map them.
         * This reduces the number of queries from N+1 to 2.
         *
        const productsWithStock = await Promise.all(
            products.map(async (product) => {
                const availableStock =
                    await this.inventoryRepository.getAvailableStock(
                        product.id,
                    );

                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    categoryId: product.categoryId,
                    imageUrl: product.imageUrl ?? undefined,
                    sku: product.sku,
                    isActive: product.isActive,
                    availableStock,
                    createdAt: product.createdAt,
                };
            }),
        );*/

        const productIds = products.map((p) => p.id);
        const stockMap = await this.inventoryRepository.getAvailableStockBulk(
            productIds,
        );


        return products.map((product) =>
            ProductMapper.toResponseDTO(product, stockMap.get(product.id) ?? 0),
        );
    }
}
