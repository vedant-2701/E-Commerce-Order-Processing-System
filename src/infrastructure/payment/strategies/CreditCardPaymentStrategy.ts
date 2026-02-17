import { inject, injectable } from "tsyringe";
import type {
    IPaymentProcessor,
    PaymentResult,
} from "@application/interfaces/services/IPaymentProcessor.js";
import { Logger } from "../../logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class CreditCardPaymentStrategy implements IPaymentProcessor {
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
            this.logger.info("Processing credit card payment", {
                amount,
                currency,
            });

            const { cardNumber, cvv, expiryDate } = paymentDetails;

            if (!this.validateCard(cardNumber, cvv, expiryDate)) {
                return {
                    success: false,
                    errorMessage: "Invalid card details",
                };
            }

            const transactionId = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            this.logger.info("Credit card payment successful", {
                transactionId,
            });

            return {
                success: true,
                transactionId,
                amount: amount,
            };
        } catch (error) {
            this.logger.error("Credit card payment failed", error);
            return {
                success: false,
                errorMessage: "Payment processing error",
            };
        }
    }

    async refundPayment(
        transactionId: string,
        amount: number,
    ): Promise<PaymentResult> {
        this.logger.info("Processing credit card refund", {
            transactionId,
            amount,
        });

        return {
            success: true,
            transactionId: `REFUND-${transactionId}`,
        };
    }

    private validateCard(
        cardNumber: string,
        cvv: string,
        expiryDate: string,
    ): boolean {
        return cardNumber?.length === 16 && cvv?.length === 3 && !!expiryDate;
    }
}
