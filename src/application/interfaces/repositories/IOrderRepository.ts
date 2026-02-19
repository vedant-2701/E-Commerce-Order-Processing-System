import type { Order } from "@domain/entities/Order.js";
import type { TransactionContext } from "./IInventoryRepository.js";

export interface IOrderRepository {
    create(order: Order, tx?: TransactionContext): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findByOrderNumber(orderNumber: string): Promise<Order | null>;
    findByUserId(userId: string, limit?: number): Promise<Order[]>;
    update(order: Order): Promise<Order>;
    delete(id: string): Promise<void>;
}
