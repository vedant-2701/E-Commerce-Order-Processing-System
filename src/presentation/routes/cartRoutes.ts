import { Router } from "express";
import { container } from "tsyringe";
import { CartController } from "../controllers/CartController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    addToCartSchema,
    getCartSchema,
    removeFromCartSchema,
} from "@presentation/validators/cartValidator.js";

const router = Router();

let cartController: CartController;

const getController = () => {
    if (!cartController) {
        cartController = container.resolve(CartController);
    }
    return cartController;
};

router.get(
    "/:userId",
    validate(getCartSchema),
    asyncHandler((req, res) => getController().getCart(req, res)),
);

router.post(
    "/add",
    validate(addToCartSchema),
    asyncHandler((req, res) => getController().addToCart(req, res)),
);

router.delete(
    "/remove",
    validate(removeFromCartSchema),
    asyncHandler((req, res) => getController().removeFromCart(req, res)),
);

export { router as cartRoutes };
