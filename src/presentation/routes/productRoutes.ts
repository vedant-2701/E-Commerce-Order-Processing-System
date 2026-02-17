import { Router } from "express";
import { container } from "tsyringe";
import { ProductController } from "../controllers/ProductController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { createProductSchema, getProductByIdSchema, getProductsSchema } from "@presentation/validators/productValidator.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";

const router = Router();

let productController: ProductController;

const getController = () => {
    if (!productController) {
        productController = container.resolve(ProductController);
    }
    return productController;
};

router.get(
    "/",
    validate(getProductsSchema),
    asyncHandler((req, res) => getController().getProducts(req, res)),
);

router.get(
    "/:productId",
    validate(getProductByIdSchema),
    asyncHandler((req, res) => getController().getProductById(req, res)),
);

router.post(
    "/",
    validate(createProductSchema),
    asyncHandler((req, res) => getController().createProduct(req, res)),
);

export { router as productRoutes };
