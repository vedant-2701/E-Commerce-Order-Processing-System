import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        name: z
            .string({ error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name must not exceed 200 characters')
            .trim(),
        description: z
            .string({ error: 'Description is required' })
            .min(10, 'Description must be at least 10 characters')
            .trim(),
        price: z
            .number({ error: 'Price is required' })
            .int('Price must be an integer (in cents)')
            .positive('Price must be greater than 0'),
        categoryId: z
            .uuid('Invalid category ID format'),
        imageUrl: z
            .url('Invalid image URL')
            .optional(),
        sku: z
            .string({ error: 'SKU is required' })
            .min(3, 'SKU must be at least 3 characters')
            .max(100, 'SKU must not exceed 100 characters')
            .trim(),
        initialStock: z
            .number()
            .int('Stock must be an integer')
            .min(0, 'Stock cannot be negative')
            .default(0),
        metadata: z
            .record(z.string(), z.any())
            .optional(),
    }),
});

export const getProductByIdSchema = z.object({
    params: z.object({
        productId: z
            .uuid('Invalid product ID format'),
    }),
});

export const getProductsSchema = z.object({
    query: z.object({
        categoryId: z
            .uuid('Invalid category ID format')
            .optional(),
        isActive: z
            .enum(['true', 'false'])
            .optional()
            .transform(val => val === 'true'),
        limit: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 50))
            .pipe(z.number().int().min(1).max(100)),
        offset: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 0))
            .pipe(z.number().int().min(0)),
    }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type GetProductsInput = z.infer<typeof getProductsSchema>;