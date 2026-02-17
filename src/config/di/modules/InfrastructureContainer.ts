import { DI_TOKENS } from "@config/di-tokens.js";
import { DatabaseConnection } from "@infrastructure/database/DatabaseConnection.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { NotificationService } from "@infrastructure/notifications/NotificationService.js";
import { EmailNotificationStrategy } from "@infrastructure/notifications/strategies/EmailNotificationStrategy.js";
import { SmsNotificationStrategy } from "@infrastructure/notifications/strategies/SmsNotificationStrategy.js";
import { PaymentProcessorFactory } from "@infrastructure/payment/PaymentProcessorFactory.js";
import { CreditCardPaymentStrategy } from "@infrastructure/payment/strategies/CreditCardPaymentStrategy.js";
import { PayPalPaymentStrategy } from "@infrastructure/payment/strategies/PayPalPaymentStrategy.js";
import { ErrorHandler } from "@presentation/middlewares/ErrorHandler.js";
import { container } from "tsyringe";

export function registerInfrastructure() {
    // Infrastructure - Singletons
    container.registerSingleton<Logger>(DI_TOKENS.Logger, Logger);
    container.registerSingleton<DatabaseConnection>(
        DI_TOKENS.DatabaseConnection,
        DatabaseConnection,
    );

    // Payment Strategies - Singletons
    container.registerSingleton<CreditCardPaymentStrategy>(
        CreditCardPaymentStrategy,
    );
    container.registerSingleton<PayPalPaymentStrategy>(PayPalPaymentStrategy);
    container.registerSingleton<PaymentProcessorFactory>(
        PaymentProcessorFactory,
    );

    // Notification Strategies - Singletons
    container.registerSingleton<EmailNotificationStrategy>(
        EmailNotificationStrategy,
    );
    container.registerSingleton<SmsNotificationStrategy>(
        SmsNotificationStrategy,
    );
    container.registerSingleton<NotificationService>(NotificationService);

    // Middleware - Singletons
    container.registerSingleton<ErrorHandler>(ErrorHandler);
}
