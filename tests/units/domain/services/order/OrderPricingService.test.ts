import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrderPricingService } from '../../../../../src/domain/services/order/OrderPricingService.js';
import { OrderItem } from '../../../../../src/domain/entities/OrderItem.js';

describe('OrderPricingService', () => {
    let orderPricingService: OrderPricingService;

    beforeEach(() => {
        orderPricingService = new OrderPricingService();
    });

    describe('calculateTotals', () => {
        it('should calculate correct totals for single item', () => {
            const orderItems: OrderItem[] = [
                {
                    id: '1',
                    orderId: 'order-1',
                    productId: 'product-1',
                    productName: 'Test Product',
                    quantity: 2,
                    unitPrice: 5000, 
                    subtotal: 10000,
                },
            ];

            const result = orderPricingService.calculateTotals(orderItems);

            
            expect(result.subtotal).toBe(10000);
            expect(result.tax).toBe(800);
            expect(result.shippingCost).toBe(0);
            expect(result.totalAmount).toBe(10800);
        });

        it('should apply shipping cost for orders under $50', () => {
            
            const orderItems: OrderItem[] = [
                {
                    id: '1',
                    orderId: 'order-1',
                    productId: 'product-1',
                    productName: 'Cheap Item',
                    quantity: 1,
                    unitPrice: 2000,
                    subtotal: 2000,
                },
            ];

            const result = orderPricingService.calculateTotals(orderItems);

            
            expect(result.subtotal).toBe(2000);
            expect(result.tax).toBe(160);
            expect(result.shippingCost).toBe(500);
            expect(result.totalAmount).toBe(2660);
        });

        it('should handle multiple items', () => {
            
            const orderItems: OrderItem[] = [
                {
                    id: '1',
                    orderId: 'order-1',
                    productId: 'product-1',
                    productName: 'Item 1',
                    quantity: 2,
                    unitPrice: 3000,
                    subtotal: 6000,
                },
                {
                    id: '2',
                    orderId: 'order-1',
                    productId: 'product-2',
                    productName: 'Item 2',
                    quantity: 1,
                    unitPrice: 2000,
                    subtotal: 2000,
                },
            ];

           
            const result = orderPricingService.calculateTotals(orderItems);

            
            expect(result.subtotal).toBe(8000);
            expect(result.tax).toBe(640);
            expect(result.shippingCost).toBe(0);
            expect(result.totalAmount).toBe(8640);
        });

        it('should handle empty items array', () => {
            
            const orderItems: OrderItem[] = [];

           
            const result = orderPricingService.calculateTotals(orderItems);

            
            expect(result.subtotal).toBe(0);
            expect(result.tax).toBe(0);
            expect(result.shippingCost).toBe(500);
            expect(result.totalAmount).toBe(500);
        });
    });
});