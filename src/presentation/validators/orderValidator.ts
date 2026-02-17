import { z } from 'zod';
import { PaymentMethod } from '../../domain/enums/PaymentMethod.js';
import { error } from 'node:console';

const orderItemSchema = z.object({
    productId: z
        .uuid('Invalid product ID format'),
    quantity: z
        .number({ error: 'Quantity is required' })
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100'),
});

const creditCardDetailsSchema = z.object({
    cardNumber: z
        .string({ error: 'Card number is required' })
        .length(16, 'Card number must be 16 digits')
        .regex(/^\d+$/, 'Card number must contain only digits'),
    cvv: z
        .string({ error: 'CVV is required' })
        .length(3, 'CVV must be 3 digits')
        .regex(/^\d+$/, 'CVV must contain only digits'),
    expiryDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
    cardHolderName: z
        .string()
        .min(2, 'Card holder name is required'),
});

const paypalDetailsSchema = z.object({
    paypalEmail: z
        .email('Invalid PayPal email'),
    paypalToken: z
        .string()
        .min(1, 'PayPal token is required'),
});

export const placeOrderSchema = z.object({
    body: z.object({
        userId: z
            .uuid('Invalid user ID format'),
        items: z
            .array(orderItemSchema)
            .min(1, 'Order must contain at least one item')
            .max(50, 'Order cannot contain more than 50 items'),
        shippingAddress: z
            .string({ error: 'Shipping address is required' })
            .min(10, 'Shipping address must be at least 10 characters')
            .trim(),
        billingAddress: z
            .string()
            .min(10, 'Billing address must be at least 10 characters')
            .trim()
            .optional(),
        paymentMethod: z.enum(PaymentMethod, { error: 'Invalid payment method' }),
        paymentDetails: z
            .union([
                creditCardDetailsSchema,
                paypalDetailsSchema,
            ])
            .optional(),
    }),
});

export const getOrderByIdSchema = z.object({
    params: z.object({
        orderId: z
            .uuid('Invalid order ID format'),
    }),
});

export const getOrderHistorySchema = z.object({
    params: z.object({
        userId: z
            .uuid('Invalid user ID format'),
    }),
    query: z.object({
        limit: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 50))
            .pipe(z.number().int().min(1).max(100)),
    }),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;