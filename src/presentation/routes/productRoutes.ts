import { Router } from "express";
import { ProductController } from "../controllers/ProductController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { createProductSchema, getProductByIdSchema, getProductsSchema } from "@presentation/validators/productValidator.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import { resolveController } from "@presentation/helpers/ControllerResolver.js";

const router = Router();

const productController = resolveController(ProductController);

router.get(
    "/",
    validate(getProductsSchema),
    asyncHandler((req, res) => productController().getProducts(req, res)),
);

router.get(
    "/:productId",
    validate(getProductByIdSchema),
    asyncHandler((req, res) => productController().getProductById(req, res)),
);

router.post(
    "/",
    validate(createProductSchema),
    asyncHandler((req, res) => productController().createProduct(req, res)),
);

export { router as productRoutes };
