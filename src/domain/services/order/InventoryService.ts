import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IInventoryRepository } from '@application/interfaces/repositories/IInventoryRepository.js';
import { Logger } from '@infrastructure/logging/Logger.js';

@injectable()
export class InventoryService {
    constructor(
        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async deductStock(
        items: Array<{ productId: string; quantity: number }>
    ): Promise<void> {
        this.logger.info('Deducting inventory for order items');

        for (const item of items) {
            await this.deductSingleItem(item.productId, item.quantity);
        }
    }

    private async deductSingleItem(
        productId: string,
        quantity: number
    ): Promise<void> {
        const inventory = await this.inventoryRepository.findByProductId(productId);

        if (!inventory) {
            this.logger.warn('Inventory record not found for product', { productId });
            return;
        }

        inventory.quantity -= quantity;
        await this.inventoryRepository.update(inventory);

        this.logger.info('Inventory deducted successfully', {
            productId,
            quantity,
            remainingStock: inventory.quantity,
        });
    }
}