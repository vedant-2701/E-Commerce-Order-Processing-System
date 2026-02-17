import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { AddToCartDTO } from "../../dto/CartItemDTO.js";
import type { ICartRepository } from "../../interfaces/repositories/ICartRepository.js";
import type { IProductRepository } from "../../interfaces/repositories/IProductRepository.js";
import { Cart } from "@domain/entities/Cart.js";
import { CartItem } from "@domain/entities/CartItem.js";
import { ValidationError } from "@shared/errors/ValidationError.js";
import { NotFoundError } from "@shared/errors/NotFoundError.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class AddToCartUseCase {
    constructor(
        @inject(DI_TOKENS.ICartRepository)
        private readonly cartRepository: ICartRepository,

        @inject(DI_TOKENS.IProductRepository)
        private readonly productRepository: IProductRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(dto: AddToCartDTO): Promise<Cart> {
        this.logger.info("Adding item to cart", {
            userId: dto.userId,
            productId: dto.productId,
        });

        if (dto.quantity <= 0) {
            throw new ValidationError("Quantity must be greater than 0");
        }

        const product = await this.productRepository.findById(dto.productId);
        if (!product) {
            throw new NotFoundError("Product", dto.productId);
        }

        if (!product.isActive) {
            throw new ValidationError("Product is not available");
        }

        let cart = await this.cartRepository.findByUserId(dto.userId);

        if (!cart) {
            cart = {
                id: uuidv4(),
                userId: dto.userId,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await this.cartRepository.create(cart);
        }

        const existingItem = cart.items.find(
            (item) => item.productId === dto.productId,
        );

        if (existingItem) {
            await this.cartRepository.updateItemQuantity(
                cart.id,
                dto.productId,
                existingItem.quantity + dto.quantity,
            );
        } else {
            const cartItem: CartItem = {
                id: uuidv4(),
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity,
                addedAt: new Date(),
            };
            await this.cartRepository.addItem(cart.id, cartItem);
        }

        const updatedCart = await this.cartRepository.findByUserId(dto.userId);

        this.logger.info("Item added to cart successfully", {
            userId: dto.userId,
            cartId: cart.id,
        });

        return updatedCart!;
    }
}
