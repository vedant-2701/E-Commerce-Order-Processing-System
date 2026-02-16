import { inject, injectable } from "tsyringe";
import type { INotificationStrategy } from "../../../application/interfaces/services/INotificationService.js";
import { Logger } from "../../logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class EmailNotificationStrategy implements INotificationStrategy {
    constructor(
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async send(
        recipient: string,
        subject: string,
        message: string,
    ): Promise<boolean> {
        this.logger.info("Sending email notification", { recipient, subject });

        console.log(`
    ------------------------------------
        📧 EMAIL NOTIFICATION
    ------------------------------------
        To: ${recipient}
        Subject: ${subject}
        Message: ${message}
    ------------------------------------
    `);

        return true;
    }
}
