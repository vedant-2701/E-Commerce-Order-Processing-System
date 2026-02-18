import { faker } from '@faker-js/faker';
import { Order } from '../../../src/domain/entities/Order.js';
import { OrderStatus } from '../../../src/domain/enums/OrderStatus.js';
import { OrderItem } from '../../../src/domain/entities/OrderItem.js';

export class OrderBuilder {
    private order: Order;

    constructor() {
        this.order = {
            id: faker.string.uuid(),
            userId: faker.string.uuid(),
            orderNumber: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
            status: OrderStatus.PENDING,
            subtotal: 10000,
            tax: 800,
            shippingCost: 500,
            totalAmount: 11300,
            shippingAddress: faker.location.streetAddress(),
            billingAddress: faker.location.streetAddress(),
            items: [],
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    withId(id: string): this {
        this.order.id = id;
        return this;
    }

    withUserId(userId: string): this {
        this.order.userId = userId;
        return this;
    }

    withStatus(status: OrderStatus): this {
        this.order.status = status;
        return this;
    }

    withItems(items: OrderItem[]): this {
        this.order.items = items;
        return this;
    }

    build(): Order {
        return { ...this.order };
    }
}