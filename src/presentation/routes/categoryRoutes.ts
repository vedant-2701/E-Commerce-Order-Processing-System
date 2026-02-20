import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController.js";
import { asyncHandler } from "../middlewares/AsyncHandler.js";
import { validate } from "@presentation/middlewares/ValidationMiddleware.js";
import {
    createCategorySchema,
    getCategoryByIdSchema,
} from "@presentation/validators/categoryValidator.js";
import { resolveController } from "@presentation/helpers/ControllerResolver.js";

const router = Router();

const categoryController = resolveController(CategoryController);

router.get(
    "/",
    asyncHandler((req, res) => categoryController().getCategories(req, res)),
);

router.get(
    "/:categoryId",
    validate(getCategoryByIdSchema),
    asyncHandler((req, res) => categoryController().getCategoryById(req, res)),
);

router.post(
    "/",
    validate(createCategorySchema),
    asyncHandler((req, res) => categoryController().createCategory(req, res)),
);

export { router as categoryRoutes };
