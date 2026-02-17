import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../controllers/OrderController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    getOrderByIdSchema,
    getOrderHistorySchema,
    placeOrderSchema,
} from "@presentation/validators/orderValidator.js";

export const orderRoutes = Router();

let orderController: OrderController;

const getController = () => {
    if (!orderController) {
        orderController = container.resolve(OrderController);
    }
    return orderController;
};

orderRoutes.post(
    "/",
    validate(placeOrderSchema),
    asyncHandler((req, res) => getController().placeOrder(req, res)),
);
orderRoutes.get(
    "/history/:userId",
    validate(getOrderHistorySchema),
    asyncHandler((req, res) => getController().getOrderHistory(req, res)),
);
orderRoutes.get(
    "/:id",
    validate(getOrderByIdSchema),
    asyncHandler((req, res) => getController().getOrderById(req, res)),
);
