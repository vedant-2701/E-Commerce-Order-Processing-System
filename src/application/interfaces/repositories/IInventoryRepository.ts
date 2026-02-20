import type { Inventory } from "@domain/entities/Inventory.js";

/**
 * Opaque transaction context type.
 * Keeps domain layer free from infrastructure types (e.g. Prisma).
 */
export type TransactionContext = unknown;

export interface IInventoryRepository {
    findByProductId(productId: string): Promise<Inventory | null>;
    create(inventory: Inventory): Promise<Inventory>;
    update(inventory: Inventory): Promise<Inventory>;
    getAvailableStock(productId: string): Promise<number>;
    getAvailableStockBulk(productIds: string[]): Promise<Map<string, number>>;
    checkAvailability(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<Map<string, boolean>>;

    /**
     * Atomically decrement stock using UPDATE ... WHERE quantity >= N.
     * Returns true if deduction succeeded, false if insufficient stock.
     * Accepts optional transaction context for transactional operations.
     */
    atomicDeductStock(
        productId: string,
        quantity: number,
        tx?: TransactionContext,
    ): Promise<boolean>;
}
