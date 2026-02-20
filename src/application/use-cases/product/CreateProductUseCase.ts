import { singleton, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { CreateProductDTO } from "../../dto/ProductDTO.js";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import type { IInventoryRepository } from "../../interfaces/repositories/IInventoryRepository.js";
import { Product } from "@domain/entities/Product.js";
import { Inventory } from "@domain/entities/Inventory.js";
import { ValidationError } from "@shared/errors/ValidationError.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@singleton()
export class CreateProductUseCase {
    constructor(
        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(dto: CreateProductDTO): Promise<Product> {
        this.logger.info("Creating product", { name: dto.name, sku: dto.sku });

        if (dto.price <= 0) {
            throw new ValidationError("Price must be greater than 0");
        }

        // SKU -> Stock Keeping Unit, unique identifier for products
        const existingProduct = await this.productRepository.findBySku(dto.sku);
        if (existingProduct) {
            throw new ValidationError(
                `Product with SKU ${dto.sku} already exists`,
            );
        }

        const product: Product = {
            id: uuidv4(),
            name: dto.name,
            description: dto.description,
            price: dto.price,
            categoryId: dto.categoryId,
            imageUrl: dto.imageUrl ?? undefined,
            sku: dto.sku,
            isActive: true,
            metadata: dto.metadata ?? undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const createdProduct = await this.productRepository.create(product);

        const inventory: Inventory = {
            id: uuidv4(),
            productId: createdProduct.id,
            quantity: dto.initialStock,
            minStockLevel: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.inventoryRepository.create(inventory);

        this.logger.info("Product created successfully", {
            productId: createdProduct.id,
        });

        return createdProduct;
    }
}
