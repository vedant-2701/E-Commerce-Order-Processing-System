import { inject, singleton } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IInventoryRepository, TransactionContext } from '@application/interfaces/repositories/IInventoryRepository.js';
import { InsufficientInventoryException } from '@domain/exceptions/InsufficientInventoryException.js';
import { Logger } from '@infrastructure/logging/Logger.js';

@singleton()
export class InventoryService {
    constructor(
        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    /**
     * Atomically deduct stock for all items.
     * Uses atomic UPDATE with WHERE guard — no read-modify-write race condition.
     * Accepts optional transaction context for transactional operations.
     */
    async deductStock(
        items: Array<{ productId: string; quantity: number }>,
        tx?: TransactionContext,
    ): Promise<void> {
        this.logger.info('Deducting inventory for order items', {
            itemCount: items.length,
            isTransactional: !!tx,
        });

        for (const item of items) {
            const success = await this.inventoryRepository.atomicDeductStock(
                item.productId,
                item.quantity,
                tx,
            );

            if (!success) {
                throw new InsufficientInventoryException(
                    `Insufficient stock for product ${item.productId}. Requested: ${item.quantity}`,
                );
            }

            this.logger.info('Inventory deducted successfully', {
                productId: item.productId,
                quantity: item.quantity,
            });
        }
    }
}