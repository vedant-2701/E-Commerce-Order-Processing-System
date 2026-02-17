import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/UserController.js';
import { asyncHandler } from '../middlewares/AsyncHandler.js';
import { validate } from '../middlewares/ValidationMiddleware.js';
import {
    createUserSchema,
    getUserByIdSchema,
    updateUserSchema,
    getUserWithOrdersSchema,
} from '../validators/userValidator.js';

const router = Router();

let userController: UserController;

const getController = () => {
    if (!userController) {
        userController = container.resolve(UserController);
    }
    return userController;
}

router.post(
    '/',
    validate(createUserSchema),
    asyncHandler((req, res) => getController().createUser(req, res)),
);

router.get(
    '/:userId',
    validate(getUserByIdSchema),
    asyncHandler((req, res) => getController().getUserById(req, res))
);

router.get(
    '/:userId/orders',
    validate(getUserWithOrdersSchema),
    asyncHandler((req, res) => getController().getUserWithOrders(req, res))
);

router.patch(
    '/:userId',
    validate(updateUserSchema),
    asyncHandler((req, res) => getController().updateUser(req, res))
);

export { router as userRoutes };