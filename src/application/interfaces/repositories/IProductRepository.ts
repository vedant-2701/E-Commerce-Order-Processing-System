import type { Product } from "@domain/entities/Product.js";

export interface IProductRepository {
    create(product: Product): Promise<Product>;
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    findAll(filters?: {
        categoryId?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<Product[]>;
    update(product: Product): Promise<Product>;
    delete(id: string): Promise<void>;
}
