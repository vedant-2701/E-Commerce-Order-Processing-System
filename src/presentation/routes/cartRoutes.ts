import { Router } from "express";
import { container } from "tsyringe";
import { CartController } from "../controllers/CartController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { ValidationMiddleware } from "@presentation/middlewares/ValidationMiddleware.js";

const router = Router();
// const cartController = container.resolve(CartController);

let cartController: CartController;

const getController = () => {
    if (!cartController) {
        cartController = container.resolve(CartController);
    }
    return cartController;
};

router.get("/:userId", asyncHandler((req, res) => getController().getCart(req, res)));

router.post(
    "/add", 
    ValidationMiddleware.validateAddToCart,
    asyncHandler((req, res) => getController().addToCart(req, res))
);

router.delete("/remove", asyncHandler((req, res) => getController().removeFromCart(req, res)));

export { router as cartRoutes };
