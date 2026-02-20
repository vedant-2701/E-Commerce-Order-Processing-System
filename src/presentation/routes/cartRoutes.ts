import { Router } from "express";
import { CartController } from "../controllers/CartController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    addToCartSchema,
    getCartSchema,
    removeFromCartSchema,
} from "@presentation/validators/cartValidator.js";
import { resolveController } from "@presentation/helpers/ControllerResolver.js";

const router = Router();

const cartController = resolveController(CartController);

router.get(
    "/:userId",
    validate(getCartSchema),
    asyncHandler((req, res) => cartController().getCart(req, res)),
);

router.post(
    "/add",
    validate(addToCartSchema),
    asyncHandler((req, res) => cartController().addToCart(req, res)),
);

router.delete(
    "/remove",
    validate(removeFromCartSchema),
    asyncHandler((req, res) => cartController().removeFromCart(req, res)),
);

export { router as cartRoutes };
