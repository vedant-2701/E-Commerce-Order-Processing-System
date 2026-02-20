import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { asyncHandler } from '../middlewares/AsyncHandler.js';
import { validate } from '../middlewares/ValidationMiddleware.js';
import {
    createUserSchema,
    getUserByIdSchema,
    updateUserSchema,
    getUserWithOrdersSchema,
} from '../validators/userValidator.js';
import { resolveController } from '@presentation/helpers/ControllerResolver.js';

const router = Router();

const userController = resolveController(UserController);

router.post(
    '/',
    validate(createUserSchema),
    asyncHandler((req, res) => userController().createUser(req, res)),
);

router.get(
    '/:userId',
    validate(getUserByIdSchema),
    asyncHandler((req, res) => userController().getUserById(req, res))
);

router.get(
    '/:userId/orders',
    validate(getUserWithOrdersSchema),
    asyncHandler((req, res) => userController().getUserWithOrders(req, res))
);

router.patch(
    '/:userId',
    validate(updateUserSchema),
    asyncHandler((req, res) => userController().updateUser(req, res))
);

export { router as userRoutes };