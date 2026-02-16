import { PaymentMethod } from "@domain/enums/PaymentMethod.js";

export interface PlaceOrderDTO {
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    shippingAddress: string;
    billingAddress: string;
    paymentMethod: PaymentMethod;
    paymentDetails: Record<string, any>;
}

