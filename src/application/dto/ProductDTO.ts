export interface CreateProductDTO {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    sku: string;
    metadata?: Record<string, any>;
    initialStock: number;
}

export interface ProductResponseDTO {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    sku: string;
    isActive: boolean;
    availableStock: number;
    createdAt: Date;
}
