import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AddToCartUseCase } from "@application/use-cases/cart/AddToCartUseCase.js";
import { RemoveFromCartUseCase } from "@application/use-cases/cart/RemoveFromCartUseCase.js";
import { GetCartUseCase } from "@application/use-cases/cart/GetCartUseCase.js";
import {
    AddToCartDTO,
    RemoveFromCartDTO,
} from "@application/dto/CartItemDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class CartController {
    constructor(
        @inject(AddToCartUseCase)
        private readonly addToCartUseCase: AddToCartUseCase,

        @inject(RemoveFromCartUseCase)
        private readonly removeFromCartUseCase: RemoveFromCartUseCase,

        @inject(GetCartUseCase)
        private readonly getCartUseCase: GetCartUseCase,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    getCart = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;

        const cart = await this.getCartUseCase.execute(userId as string);

        res.status(200).json({
            success: true,
            data: cart,
        });
    };

    addToCart = async (req: Request, res: Response): Promise<void> => {
        const dto: AddToCartDTO = {
            userId: req.body.userId,
            productId: req.body.productId,
            quantity: req.body.quantity,
        };

        const cart = await this.addToCartUseCase.execute(dto);

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            data: cart,
        });
    };

    removeFromCart = async (req: Request, res: Response): Promise<void> => {
        const dto: RemoveFromCartDTO = {
            userId: req.body.userId,
            productId: req.body.productId,
        };

        await this.removeFromCartUseCase.execute(dto);

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
        });
    };
}
