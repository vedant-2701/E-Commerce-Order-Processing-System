import type { OrderStatus } from "@domain/enums/OrderStatus.js";
import type { OrderItem } from "./OrderItem.js";
import type { Payment } from "./Payment.js";

export interface Order {
    id: string;
    userId: string;
    orderNumber: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
    shippingAddress: string;
    billingAddress: string;
    notes?: string;
    payment?: Payment;
    createdAt: Date;
    updatedAt: Date;
}
