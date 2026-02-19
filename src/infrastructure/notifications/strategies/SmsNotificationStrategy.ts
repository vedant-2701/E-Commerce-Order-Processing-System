import { inject, singleton } from "tsyringe";
import type { INotificationStrategy } from "@application/interfaces/services/INotificationService.js";
import { Logger } from "../../logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@singleton()
export class SmsNotificationStrategy implements INotificationStrategy {
    constructor(
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async send(
        recipient: string,
        subject: string,
        message: string,
    ): Promise<boolean> {
        this.logger.info("Sending SMS notification", { recipient });

        console.log(`
    ------------------------------------
        📱 SMS NOTIFICATION
    ------------------------------------
        To: ${recipient}
        Message: ${message}
    ------------------------------------
    `);

        return true;
    }
}
