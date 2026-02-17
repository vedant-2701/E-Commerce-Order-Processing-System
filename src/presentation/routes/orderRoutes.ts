import { Router } from "express";
import { container } from "tsyringe";
import { OrderController } from "../controllers/OrderController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";

export const orderRoutes = Router();

let orderController: OrderController;

// Lazy getter - resolves only once when first accessed
const getController = () => {
    if (!orderController) {
        orderController = container.resolve(OrderController);
    }
    return orderController;
};

orderRoutes.post("/", asyncHandler((req, res) => getController().placeOrder(req, res)));
orderRoutes.get("/history/:userId", asyncHandler((req, res) => getController().getOrderHistory(req, res)));
orderRoutes.get("/:id", asyncHandler((req, res) => getController().getOrderById(req, res)));