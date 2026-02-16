import { AppError } from "../../shared/errors/AppError.js";

export class InsufficientInventoryException extends AppError {
    constructor(message: string) {
        super(message, 409, "INSUFFICIENT_INVENTORY");
    }
}
