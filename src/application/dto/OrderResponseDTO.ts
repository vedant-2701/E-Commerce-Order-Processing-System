import { OrderStatus } from "@domain/enums/OrderStatus.js";

export interface OrderResponseDTO {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: Date;
    items: Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
}
