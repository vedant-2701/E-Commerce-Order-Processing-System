import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        email: z
            .email('Invalid email format')
            .trim()
            .toLowerCase(),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must not exceed 100 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
        firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must not exceed 50 characters')
            .trim(),
        lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must not exceed 50 characters')
            .trim(),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
    }),
});

export const getUserByIdSchema = z.object({
    params: z.object({
        userId: z
            .uuid('User ID must be a valid UUID'),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        userId: z
            .uuid('User ID must be a valid UUID'),
    }),
    body: z.object({
        firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must not exceed 50 characters')
            .trim()
            .optional(),
        lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must not exceed 50 characters')
            .trim()
            .optional(),
        phone: z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
    }).refine(
        data => Object.values(data).some(v => v !== undefined),
        { message: 'At least one field must be provided for update' }
    ),
});

export const getUserWithOrdersSchema = z.object({
    params: z.object({
        userId: z
            .uuid('User ID must be a valid UUID'),
    }),
});