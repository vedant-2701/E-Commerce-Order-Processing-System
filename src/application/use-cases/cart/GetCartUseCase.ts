import { injectable, inject } from "tsyringe";
import type { ICartRepository } from "../../interfaces/repositories/ICartRepository.js";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import { CartResponseDTO } from "../../dto/CartItemDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class GetCartUseCase {
    constructor(
        @inject(DI_TOKENS.ICartRepository)
        private readonly cartRepository: ICartRepository,

        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(userId: string): Promise<CartResponseDTO | null> {
        this.logger.info("Fetching cart", { userId });

        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            return null;
        }

        const enrichedItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await this.productRepository.findById(
                    item.productId,
                );
                return {
                    id: item.id,
                    productId: item.productId,
                    productName: product?.name || "Unknown Product",
                    quantity: item.quantity,
                    unitPrice: product?.price || 0,
                    subtotal: (product?.price || 0) * item.quantity,
                };
            }),
        );

        const totalAmount = enrichedItems.reduce(
            (sum, item) => sum + item.subtotal,
            0,
        );
        const totalItems = enrichedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        return {
            id: cart.id,
            userId: cart.userId,
            items: enrichedItems,
            totalItems,
            totalAmount,
        };
    }
}
