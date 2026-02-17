import { Router } from "express";
import { container } from "tsyringe";
import { CategoryController } from "../controllers/CategoryController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    createCategorySchema,
    getCategoryByIdSchema,
} from "@presentation/validators/categoryValidator.js";

const router = Router();

let categoryController: CategoryController;

const getController = () => {
    if (!categoryController) {
        categoryController = container.resolve(CategoryController);
    }
    return categoryController;
};

router.get(
    "/",
    asyncHandler((req, res) => getController().getCategories(req, res)),
);

router.get(
    "/:categoryId",
    validate(getCategoryByIdSchema),
    asyncHandler((req, res) => getController().getCategoryById(req, res)),
);

router.post(
    "/",
    validate(createCategorySchema),
    asyncHandler((req, res) => getController().createCategory(req, res)),
);

export { router as categoryRoutes };
