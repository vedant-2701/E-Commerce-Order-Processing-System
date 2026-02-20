import { AppError } from "@shared/errors/AppError.js";

export class DomainException extends AppError {
    constructor(message: string) {
        super(message);
        this.name = "DomainException";
    }
}
