import { AppError } from "../../shared/errors/AppError.js";

export class PaymentFailedException extends AppError {
    constructor(message: string, failureReason?: string) {
        super(message, 402, "PAYMENT_FAILED", { failureReason });
    }
}

