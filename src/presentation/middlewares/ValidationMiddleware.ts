import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/errors/ValidationError.js";

export class ValidationMiddleware {
    static validatePlaceOrder(
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        const { userId, items, shippingAddress, paymentMethod } = req.body;

        if (!userId) {
            throw new ValidationError("userId is required");
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new ValidationError(
                "items array is required and must not be empty",
            );
        }

        if (!shippingAddress) {
            throw new ValidationError("shippingAddress is required");
        }

        if (!paymentMethod) {
            throw new ValidationError("paymentMethod is required");
        }

        next();
    }

    static validateAddToCart(
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        const { userId, productId, quantity } = req.body;

        if (!userId) {
            throw new ValidationError("userId is required");
        }

        if (!productId) {
            throw new ValidationError("productId is required");
        }

        if (!quantity || quantity <= 0) {
            throw new ValidationError("quantity must be greater than 0");
        }

        next();
    }
}
