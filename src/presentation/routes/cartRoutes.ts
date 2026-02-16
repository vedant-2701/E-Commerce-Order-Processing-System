import { Router } from "express";
import { container } from "tsyringe";
import { CartController } from "../controllers/CartController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { ValidationMiddleware } from "@presentation/middlewares/ValidationMiddleware.js";

const router = Router();
const cartController = container.resolve(CartController);


router.get("/:userId", asyncHandler(cartController.getCart));

router.post(
    "/add", 
    ValidationMiddleware.validateAddToCart,
    asyncHandler(cartController.addToCart)
);

router.delete("/remove", asyncHandler(cartController.removeFromCart));

export { router as cartRoutes };
