import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrderFactory } from '../../../../src/domain/factories/OrderFactory.js';
import { PlaceOrderDTO } from '../../../../src/application/dto/PlaceOrderDTO.js';
import { OrderItem } from '../../../../src/domain/entities/OrderItem.js';
import { PaymentMethod } from '../../../../src/domain/enums/PaymentMethod.js';
import { OrderStatus } from '../../../../src/domain/enums/OrderStatus.js';

describe('OrderFactory', () => {
    let orderFactory: OrderFactory;

    beforeEach(() => {
        orderFactory = new OrderFactory();
    });

    describe('createOrder', () => {
        it('should create order with correct properties', () => {
           
            const dto: PlaceOrderDTO = {
                userId: 'user-123',
                items: [],
                shippingAddress: 'Main St',
                billingAddress: 'Main St',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                paymentDetails: {},
            };

            const orderItems: OrderItem[] = [
                {
                    id: 'item-1',
                    orderId: '',
                    productId: 'product-1',
                    productName: 'Test Product',
                    quantity: 2,
                    unitPrice: 5000,
                    subtotal: 10000,
                },
            ];

            const totals = {
                subtotal: 10000,
                tax: 800,
                shippingCost: 0,
                totalAmount: 10800,
            };

            
            const order = orderFactory.createOrder(dto, orderItems, totals);

            
            expect(order.id).toBeDefined();
            expect(order.userId).toBe('user-123');
            expect(order.orderNumber).toMatch(/^ORD-/);
            expect(order.status).toBe(OrderStatus.PENDING);
            expect(order.subtotal).toBe(10000);
            expect(order.tax).toBe(800);
            expect(order.shippingCost).toBe(0);
            expect(order.totalAmount).toBe(10800);
            expect(order.shippingAddress).toBe('Main St');
            expect(order.billingAddress).toBe('Main St');
            expect(order.items).toHaveLength(1);
            expect(order.items[0].orderId).toBe(order.id);
        });

        it('should assign orderId to all items', () => {
           
            const dto: PlaceOrderDTO = {
                userId: 'user-123',
                items: [],
                shippingAddress: 'Main St',
                billingAddress: 'Main St',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                paymentDetails: {},
            };

            const orderItems: OrderItem[] = [
                {
                    id: 'item-1',
                    orderId: '',
                    productId: 'product-1',
                    productName: 'Product 1',
                    quantity: 1,
                    unitPrice: 1000,
                    subtotal: 1000,
                },
                {
                    id: 'item-2',
                    orderId: '',
                    productId: 'product-2',
                    productName: 'Product 2',
                    quantity: 1,
                    unitPrice: 2000,
                    subtotal: 2000,
                },
            ];

            const totals = {
                subtotal: 3000,
                tax: 240,
                shippingCost: 500,
                totalAmount: 3740,
            };

            
            const order = orderFactory.createOrder(dto, orderItems, totals);

            
            expect(order.items).toHaveLength(2);
            expect(order.items[0].orderId).toBe(order.id);
            expect(order.items[1].orderId).toBe(order.id);
        });

        it('should generate unique order numbers', () => {
           
            const dto: PlaceOrderDTO = {
                userId: 'user-123',
                items: [],
                shippingAddress: 'Main St',
                billingAddress: 'Main St',
                paymentMethod: PaymentMethod.CREDIT_CARD,
                paymentDetails: {},
            };

            const totals = {
                subtotal: 1000,
                tax: 80,
                shippingCost: 500,
                totalAmount: 1580,
            };

            
            const order1 = orderFactory.createOrder(dto, [], totals);
            const order2 = orderFactory.createOrder(dto, [], totals);

            
            expect(order1.orderNumber).not.toBe(order2.orderNumber);
        });
    });
});