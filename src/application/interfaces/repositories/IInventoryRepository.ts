import type { Inventory } from "../../../domain/entities/Inventory.js";

export interface IInventoryRepository {
    findByProductId(productId: string): Promise<Inventory | null>;
    create(inventory: Inventory): Promise<Inventory>;
    update(inventory: Inventory): Promise<Inventory>;
    getAvailableStock(productId: string): Promise<number>;
    checkAvailability(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<Map<string, boolean>>;
}
