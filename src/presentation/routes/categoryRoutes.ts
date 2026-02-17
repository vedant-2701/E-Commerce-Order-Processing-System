import { Router } from "express";
import { container } from "tsyringe";
import { CategoryController } from "../controllers/CategoryController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";

const router = Router();
// const categoryController = container.resolve(CategoryController);

let categoryController: CategoryController;

const getController = () => {
    if (!categoryController) {
        categoryController = container.resolve(CategoryController);
    }
    return categoryController;
};

router.get("/", asyncHandler((req, res) => getController().getCategories(req, res)));

router.get("/:categoryId", asyncHandler((req, res) => getController().getCategoryById(req, res)));

router.post("/", asyncHandler((req, res) => getController().createCategory(req, res)));

export { router as categoryRoutes };
