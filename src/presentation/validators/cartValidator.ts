// presentation/validators/cartValidator.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
    body: z.object({
        userId: z
            .uuid('Invalid user ID format'),
        productId: z
            .uuid('Invalid product ID format'),
        quantity: z
            .number({ error: 'Quantity is required' })
            .int('Quantity must be an integer')
            .min(1, 'Quantity must be at least 1')
            .max(100, 'Quantity cannot exceed 100'),
    }),
});

export const removeFromCartSchema = z.object({
    body: z.object({
        userId: z
            .uuid('Invalid user ID format'),
        productId: z
            .uuid('Invalid product ID format'),
    }),
});

export const getCartSchema = z.object({
    params: z.object({
        userId: z
            .uuid('Invalid user ID format'),
    }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;