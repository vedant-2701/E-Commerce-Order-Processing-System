import type { Inventory } from "../../../domain/entities/Inventory.js";

export interface IInventoryRepository {
    findByProductId(productId: string): Promise<Inventory | null>;
    create(inventory: Inventory): Promise<Inventory>;
    update(inventory: Inventory): Promise<Inventory>;
    reserveStock(productId: string, quantity: number): Promise<void>;
    deductStock(productId: string, quantity: number): Promise<void>;
    releaseReservedStock(productId: string, quantity: number): Promise<void>;
    getAvailableStock(productId: string): Promise<number>;
    checkAvailability(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<Map<string, boolean>>;
}
