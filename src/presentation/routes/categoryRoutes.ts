import { Router } from "express";
import { container } from "tsyringe";
import { CategoryController } from "../controllers/CategoryController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";

const router = Router();
const categoryController = container.resolve(CategoryController);

router.get("/", asyncHandler(categoryController.getCategories));

router.get("/:categoryId", asyncHandler(categoryController.getCategoryById));

router.post("/", asyncHandler(categoryController.createCategory));

export { router as categoryRoutes };
