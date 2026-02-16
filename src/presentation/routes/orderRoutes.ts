import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../controllers/OrderController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { ValidationMiddleware } from "@presentation/middlewares/ValidationMiddleware.js";

const router = Router();
const orderController = container.resolve(OrderController);

router.post(
    "/",
    ValidationMiddleware.validatePlaceOrder,
    asyncHandler(orderController.placeOrder),
);

router.get("/history/:userId", asyncHandler(orderController.getOrderHistory));

router.get("/:orderId", asyncHandler(orderController.getOrderById));

export { router as orderRoutes };
