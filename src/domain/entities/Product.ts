export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    sku: string; // Stock Keeping Unit, unique identifier for inventory management
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}