import { PaymentMethod } from "../enums/PaymentMethod.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    failureReason?: string;
    processedAt?: Date;
    createdAt: Date;
}
