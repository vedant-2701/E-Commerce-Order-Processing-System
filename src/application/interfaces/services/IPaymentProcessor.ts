export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    errorMessage?: string;
    amount?: number;
}

export interface IPaymentProcessor {
    processPayment(
        amount: number,
        currency: string,
        paymentDetails: Record<string, any>,
    ): Promise<PaymentResult>;

    refundPayment(
        transactionId: string,
        amount: number,
    ): Promise<PaymentResult>;
}
