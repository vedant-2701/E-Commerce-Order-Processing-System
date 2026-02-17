import { z } from 'zod';

export const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string({ error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters')
            .trim(),
        description: z
            .string()
            .max(500, 'Description must not exceed 500 characters')
            .trim()
            .optional(),
    }),
});

export const getCategoryByIdSchema = z.object({
    params: z.object({
        categoryId: z
            .uuid('Invalid category ID format'),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;