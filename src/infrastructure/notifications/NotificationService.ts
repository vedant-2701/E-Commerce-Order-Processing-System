import { inject, singleton } from "tsyringe";
import type { INotificationStrategy } from "@application/interfaces/services/INotificationService.js";
import { EmailNotificationStrategy } from "./strategies/EmailNotificationStrategy.js";
import { SmsNotificationStrategy } from "./strategies/SmsNotificationStrategy.js";

@singleton()
export class NotificationService {
    private strategies: Map<string, INotificationStrategy> = new Map();

    constructor(
        @inject(EmailNotificationStrategy)
        emailStrategy: EmailNotificationStrategy,

        @inject(SmsNotificationStrategy)
        smsStrategy: SmsNotificationStrategy,
    ) {
        this.strategies.set("email", emailStrategy);
        this.strategies.set("sms", smsStrategy);
    }

    async notify(
        channel: "email" | "sms",
        recipient: string,
        subject: string,
        message: string,
    ): Promise<void> {
        const strategy = this.strategies.get(channel);
        if (!strategy) {
            throw new Error(`Notification channel '${channel}' not supported`);
        }
        await strategy.send(recipient, subject, message);
    }

    async notifyAll(
        recipient: string,
        subject: string,
        message: string,
    ): Promise<void> {
        await Promise.all([
            this.notify("email", recipient, subject, message),
            this.notify("sms", recipient, subject, message),
        ]);
    }
}
