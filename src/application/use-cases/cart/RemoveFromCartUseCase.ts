import { injectable, inject } from "tsyringe";
import { RemoveFromCartDTO } from "../../dto/CartItemDTO.js";
import type { ICartRepository } from "../../interfaces/repositories/ICartRepository.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { Logger } from "../../../infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class RemoveFromCartUseCase {
    constructor(
        @inject(DI_TOKENS.ICartRepository)
        private readonly cartRepository: ICartRepository,
        
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(dto: RemoveFromCartDTO): Promise<void> {
        this.logger.info("Removing item from cart", {
            userId: dto.userId,
            productId: dto.productId,
        });

        const cart = await this.cartRepository.findByUserId(dto.userId);
        if (!cart) {
            throw new NotFoundError("Cart for user", dto.userId);
        }

        await this.cartRepository.removeItem(cart.id, dto.productId);

        this.logger.info("Item removed from cart successfully");
    }
}
