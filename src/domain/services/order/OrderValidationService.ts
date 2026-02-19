import { inject, singleton } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IProductRepository } from '@application/interfaces/repositories/IProductRepository.js';
import type { IInventoryRepository } from '@application/interfaces/repositories/IInventoryRepository.js';
import { OrderItem } from '../../entities/OrderItem.js';
import { ValidationError } from '@shared/errors/ValidationError.js';
import { InsufficientInventoryException } from '../../exceptions/InsufficientInventoryException.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { v4 as uuidv4 } from 'uuid';

@singleton()
export class OrderValidationService {
    constructor(
        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.IInventoryRepository)
        private readonly inventoryRepository: IInventoryRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async validateAndBuildOrderItems(
        items: Array<{ productId: string; quantity: number }>
    ): Promise<OrderItem[]> {
        this.logger.info('Validating products and inventory');

        const orderItems: OrderItem[] = [];

        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);

            if (!product) {
                throw new ValidationError(`Product ${item.productId} not found`);
            }

            if (!product.isActive) {
                throw new ValidationError(`Product ${product.name} is no longer available`);
            }

            const availableStock = await this.inventoryRepository.getAvailableStock(item.productId);

            if (availableStock < item.quantity) {
                throw new InsufficientInventoryException(
                    `Insufficient inventory for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
                );
            }

            orderItems.push({
                id: uuidv4(),
                orderId: '',
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal: product.price * item.quantity,
            });
        }

        return orderItems;
    }
}