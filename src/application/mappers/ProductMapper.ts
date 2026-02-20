import { Product } from '@domain/entities/Product.js';
import { ProductResponseDTO } from '../dto/ProductDTO.js';

export class ProductMapper {
    static toResponseDTO(product: Product, availableStock: number): ProductResponseDTO {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl,
            sku: product.sku,
            isActive: product.isActive,
            availableStock,
            createdAt: product.createdAt,
        };
    }
}