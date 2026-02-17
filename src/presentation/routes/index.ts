import { Router } from 'express';
import { orderRoutes } from './orderRoutes.js';
import { cartRoutes } from './cartRoutes.js';
import { productRoutes } from './productRoutes.js';
import { categoryRoutes } from './categoryRoutes.js';
import { userRoutes } from './userRoutes.js';

const router = Router();

router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };