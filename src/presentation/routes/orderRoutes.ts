import { Router } from "express";
import { OrderController } from "../controllers/OrderController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    getOrderByIdSchema,
    getOrderHistorySchema,
    placeOrderSchema,
} from "@presentation/validators/orderValidator.js";
import { resolveController } from "@presentation/helpers/ControllerResolver.js";

const router = Router();

const orderController = resolveController(OrderController);

router.post(
    "/",
    validate(placeOrderSchema),
    asyncHandler((req, res) => orderController().placeOrder(req, res)),
);
router.get(
    "/history/:userId",
    validate(getOrderHistorySchema),
    asyncHandler((req, res) => orderController().getOrderHistory(req, res)),
);
router.get(
    "/:orderId",
    validate(getOrderByIdSchema),
    asyncHandler((req, res) => orderController().getOrderById(req, res)),
);

export { router as orderRoutes };