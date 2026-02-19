import { inject, singleton } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../entities/Order.js';
import { Payment } from '../../entities/Payment.js';
import { PaymentStatus } from '../../enums/PaymentStatus.js';
import { PlaceOrderDTO } from '@application/dto/PlaceOrderDTO.js';
import { PaymentProcessorFactory } from '@infrastructure/payment/PaymentProcessorFactory.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { DI_TOKENS } from '@config/di-tokens.js';

@singleton()
export class PaymentService {
    constructor(
        @inject(PaymentProcessorFactory)
        private readonly paymentProcessorFactory: PaymentProcessorFactory,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async processPayment(order: Order, dto: PlaceOrderDTO): Promise<Payment> {
        this.logger.info('Processing payment', {
            orderId: order.id,
            method: dto.paymentMethod,
            amount: order.totalAmount,
        });

        const payment = this.createPendingPayment(order, dto);

        try {
            const processor = this.paymentProcessorFactory.getProcessor(dto.paymentMethod);

            const result = await processor.processPayment(
                order.totalAmount,
                'INR',
                dto.paymentDetails
            );

            return result.success
                ? this.markPaymentCaptured(payment, result.transactionId!)
                : this.markPaymentFailed(payment, result.errorMessage ?? 'Payment failed');

        } catch (error) {
            this.logger.error('Payment processing error', error);
            const reason = error instanceof Error ? error.message : 'Unknown error';
            return this.markPaymentFailed(payment, reason);
        }
    }

    private createPendingPayment(order: Order, dto: PlaceOrderDTO): Payment {
        return {
            id: uuidv4(),
            orderId: order.id,
            amount: order.totalAmount,
            method: dto.paymentMethod,
            status: PaymentStatus.PENDING,
            createdAt: new Date(),
        };
    }

    private markPaymentCaptured(payment: Payment, transactionId: string): Payment {
        return {
            ...payment,
            status: PaymentStatus.CAPTURED,
            transactionId,
            processedAt: new Date(),
        };
    }

    private markPaymentFailed(payment: Payment, failureReason: string): Payment {
        return {
            ...payment,
            status: PaymentStatus.FAILED,
            failureReason,
        };
    }
}