import { IInventoryRepository } from "@application/interfaces/repositories/IInventoryRepository.js";
import { singleton, inject } from "tsyringe";
import { DatabaseConnection } from "../DatabaseConnection.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Inventory } from "@domain/entities/Inventory.js";
import { Prisma } from "generated/prisma/client.js";
import type { TransactionContext } from "@application/interfaces/repositories/IInventoryRepository.js";

@singleton()
export class InventoryRepository implements IInventoryRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async findByProductId(productId: string): Promise<Inventory | null> {
        const inventory = await this.prisma.inventory.findUnique({
            where: { productId },
        });

        return inventory ? this.toDomain(inventory) : null;
    }

    async create(inventory: Inventory): Promise<Inventory> {
        const created = await this.prisma.inventory.create({
            data: {
                id: inventory.id,
                productId: inventory.productId,
                quantity: inventory.quantity,
                lastRestockDate: inventory.lastRestockDate,
                minStockLevel: inventory.minStockLevel || 10,
            },
        });

        return this.toDomain(created);
    }

    async update(inventory: Inventory): Promise<Inventory> {
        const updated = await this.prisma.inventory.update({
            where: { productId: inventory.productId },
            data: {
                quantity: inventory.quantity,
                lastRestockDate: inventory.lastRestockDate,
            },
        });

        return this.toDomain(updated);
    }

    async getAvailableStock(productId: string): Promise<number> {
        const inventory = await this.prisma.inventory.findUnique({
            where: { productId },
            select: {
                quantity: true,
            },
        });

        if (!inventory) {
            return 0;
        }

        return inventory.quantity;
    }

    async checkAvailability(
        items: Array<{ productId: string; quantity: number }>,
    ): Promise<Map<string, boolean>> {
        const productIds = items.map((item) => item.productId);

        const inventories = await this.prisma.inventory.findMany({
            where: {
                productId: { in: productIds },
            },
        });

        const availabilityMap = new Map<string, boolean>();

        for (const item of items) {
            const inventory = inventories.find(
                (inv) => inv.productId === item.productId,
            );
            if (!inventory) {
                availabilityMap.set(item.productId, false);
                continue;
            }

            availabilityMap.set(
                item.productId,
                inventory.quantity >= item.quantity,
            );
        }

        return availabilityMap;
    }

    private toDomain(prismaInventory: any): Inventory {
        return {
            id: prismaInventory.id,
            productId: prismaInventory.productId,
            quantity: prismaInventory.quantity,
            lastRestockDate: prismaInventory.lastRestockDate,
            minStockLevel: prismaInventory.minStockLevel,
            updatedAt: prismaInventory.updatedAt,
            createdAt: prismaInventory.createdAt,
        };
    }

    /**
     * Atomically decrement stock using a single UPDATE with a WHERE guard.
     * - No read-modify-write race condition
     * - Implicit row-level lock only during the UPDATE (microseconds)
     * - Returns true if rows affected, false if insufficient stock
     */
    async atomicDeductStock(
        productId: string,
        quantity: number,
        tx?: TransactionContext,
    ): Promise<boolean> {
        const client = (tx as Prisma.TransactionClient) ?? this.prisma;

        const result = await client.inventory.updateMany({
            where: {
                productId,
                quantity: { gte: quantity },
            },
            data: {
                quantity: { decrement: quantity },
            },
        });

        return result.count > 0;
    }
}
