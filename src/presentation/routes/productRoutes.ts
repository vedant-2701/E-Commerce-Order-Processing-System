import { Router } from "express";
import { container } from "tsyringe";
import { ProductController } from "../controllers/ProductController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";

const router = Router();
// const productController = container.resolve(ProductController);

let productController: ProductController;

const getController = () => {
    if (!productController) {
        productController = container.resolve(ProductController);
    }
    return productController;
};

router.get("/", asyncHandler((req, res) => getController().getProducts(req, res)));

router.get("/:productId", asyncHandler((req, res) => getController().getProductById(req, res)));

router.post("/", asyncHandler((req, res) => getController().createProduct(req, res)));

export { router as productRoutes };
