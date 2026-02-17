import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { OrderStatus } from '../enums/OrderStatus.js';
import { PlaceOrderDTO } from '../../application/dto/PlaceOrderDTO.js';
import { OrderTotals } from '../services/order/OrderPricingService.js';

@injectable()
export class OrderFactory {

    createOrder(
        dto: PlaceOrderDTO,
        orderItems: OrderItem[],
        totals: OrderTotals
    ): Order {
        const orderId = uuidv4();
        const orderNumber = this.generateOrderNumber();

        // Assign orderId to all items
        const itemsWithOrderId = orderItems.map(item => ({
            ...item,
            orderId,
        }));

        return {
            id: orderId,
            userId: dto.userId,
            orderNumber,
            status: OrderStatus.PENDING,
            subtotal: totals.subtotal,
            tax: totals.tax,
            shippingCost: totals.shippingCost,
            totalAmount: totals.totalAmount,
            shippingAddress: dto.shippingAddress,
            billingAddress: dto.billingAddress,
            items: itemsWithOrderId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private generateOrderNumber(): string {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }
}