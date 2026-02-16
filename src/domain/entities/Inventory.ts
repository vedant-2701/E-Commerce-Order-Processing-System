export interface Inventory {
    id: string;
    productId: string;
    quantity: number;
    lastRestockDate?: Date;
    minStockLevel?: number;
    createdAt: Date;
    updatedAt: Date;
};