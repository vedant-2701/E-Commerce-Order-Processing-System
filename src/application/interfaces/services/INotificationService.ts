export interface INotificationStrategy {
    send(recipient: string, subject: string, message: string): Promise<boolean>;
}
