import { injectable } from "tsyringe";
import { OrderItem } from "../../entities/OrderItem.js";

export interface OrderTotals {
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
}

@injectable()
export class OrderPricingService {
    private readonly TAX_RATE = 0.08;
    private readonly FREE_SHIPPING_THRESHOLD = 5000;
    private readonly SHIPPING_COST = 500;

    calculateTotals(orderItems: OrderItem[]): OrderTotals {
        const subtotal = this.calculateSubtotal(orderItems);
        const tax = this.calculateTax(subtotal);
        const shippingCost = this.calculateShipping(subtotal);
        const totalAmount = subtotal + tax + shippingCost;

        return { subtotal, tax, shippingCost, totalAmount };
    }

    private calculateSubtotal(orderItems: OrderItem[]): number {
        return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    }

    private calculateTax(subtotal: number): number {
        return Math.round(subtotal * this.TAX_RATE);
    }

    private calculateShipping(subtotal: number): number {
        return subtotal > this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
    }
}
