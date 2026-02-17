import { injectable, inject } from "tsyringe";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import type { IInventoryRepository } from "../../interfaces/repositories/IInventoryRepository.js";
import { ProductResponseDTO } from "../../dto/ProductDTO.js";
import { NotFoundError } from "@shared/errors/NotFoundError.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class GetProductByIdUseCase {
    constructor(
        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,
        
        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(productId: string): Promise<ProductResponseDTO> {
        this.logger.info("Fetching product by ID", { productId });

        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new NotFoundError("Product", productId);
        }

        const availableStock = await this.inventoryRepository.getAvailableStock(
            product.id,
        );

        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl ?? "",
            sku: product.sku,
            isActive: product.isActive,
            availableStock,
            createdAt: product.createdAt,
        };
    }
}
