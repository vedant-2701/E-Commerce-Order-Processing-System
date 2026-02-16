import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { Logger } from "../../infrastructure/logging/Logger.js";
import { injectable, inject } from "tsyringe";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class ErrorHandler {
    constructor(
        @inject(DI_TOKENS.Logger) private readonly logger: Logger
    ) {}

    handle = (
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        if (err instanceof AppError) {
            this.logger.warn("Application error", {
                error: err.name,
                message: err.message,
                statusCode: err.statusCode,
                path: req.path,
                method: req.method,
            });

            res.status(err.statusCode).json(err.toJSON());
            return;
        }

        this.logger.error("Unhandled error", {
            error: err.name,
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });

        res.status(500).json({
            error: {
                name: "InternalServerError",
                message: "An unexpected error occurred",
                statusCode: 500,
            },
        });
    };
}
