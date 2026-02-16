import { Router } from "express";
import { container } from "tsyringe";
import { ProductController } from "../controllers/ProductController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";

const router = Router();
const productController = container.resolve(ProductController);

router.get("/", asyncHandler(productController.getProducts));

router.get("/:productId", asyncHandler(productController.getProductById));

router.post("/", asyncHandler(productController.createProduct));

export { router as productRoutes };
