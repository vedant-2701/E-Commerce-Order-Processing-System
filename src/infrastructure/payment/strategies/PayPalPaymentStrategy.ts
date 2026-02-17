import { inject, injectable } from "tsyringe";
import type {
    IPaymentProcessor,
    PaymentResult,
} from "@application/interfaces/services/IPaymentProcessor.js";
import { Logger } from "../../logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class PayPalPaymentStrategy implements IPaymentProcessor {
    constructor(
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async processPayment(
        amount: number,
        currency: string,
        paymentDetails: Record<string, any>,
    ): Promise<PaymentResult> {
        try {
            this.logger.info("Processing PayPal payment", { amount, currency });

            const { paypalEmail, paypalToken } = paymentDetails;

            if (!paypalEmail || !paypalToken) {
                return {
                    success: false,
                    errorMessage: "Invalid PayPal credentials",
                };
            }

            const transactionId = `PP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Simulate 95% success rate
            if (Math.random() < 0.95) {
                this.logger.info("PayPal payment successful", {
                    transactionId,
                });
                return {
                    success: true,
                    transactionId,
                    amount: amount,
                };
            }

            return {
                success: false,
                errorMessage: "Insufficient PayPal balance",
            };
        } catch (error) {
            this.logger.error("PayPal payment failed", error);
            return {
                success: false,
                errorMessage: "PayPal service unavailable",
            };
        }
    }

    async refundPayment(
        transactionId: string,
        amount: number,
    ): Promise<PaymentResult> {
        this.logger.info("Processing PayPal refund", { transactionId, amount });
        return {
            success: true,
            transactionId: `REFUND-${transactionId}`,
        };
    }
}
