import { Response } from "express";

export class ResponseHelper {
    static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): void {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static created<T>(res: Response, data: T, message?: string): void {
        this.success(res, data, message, 201);
    }

    static noContent(res: Response, message?: string): void {
        res.status(204).send();
    }
}