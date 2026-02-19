import { inject, singleton } from "tsyringe";
import type { IPaymentProcessor } from "@application/interfaces/services/IPaymentProcessor.js";
import { PaymentMethod } from "@domain/enums/PaymentMethod.js";
import { CreditCardPaymentStrategy } from "./strategies/CreditCardPaymentStrategy.js";
import { PayPalPaymentStrategy } from "./strategies/PayPalPaymentStrategy.js";
import { AppError } from "@shared/errors/AppError.js";

@singleton()
export class PaymentProcessorFactory {
    constructor(
        @inject(CreditCardPaymentStrategy)
        private readonly creditCardProcessor: CreditCardPaymentStrategy,
        
        @inject(PayPalPaymentStrategy)
        private readonly paypalProcessor: PayPalPaymentStrategy,
    ) {}

    getProcessor(method: PaymentMethod): IPaymentProcessor {
        switch (method) {
            case PaymentMethod.CREDIT_CARD:
                return this.creditCardProcessor;

            case PaymentMethod.PAYPAL:
                return this.paypalProcessor;

            default:
                throw new AppError(
                    `Unsupported payment method: ${method}`,
                    400,
                );
        }
    }
}
