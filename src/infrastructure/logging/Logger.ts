// infrastructure/logging/Logger.ts
import { injectable } from "tsyringe";

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

@injectable()
export class Logger {
    constructor(private readonly serviceName: string = "ECommerceService") {}

    private log(level: LogLevel, message: string, metadata?: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.serviceName,
            message,
            ...metadata,
        };

        console.log(JSON.stringify(logEntry));
    }

    debug(message: string, metadata?: any): void {
        this.log(LogLevel.DEBUG, message, metadata);
    }

    info(message: string, metadata?: any): void {
        this.log(LogLevel.INFO, message, metadata);
    }

    warn(message: string, metadata?: any): void {
        this.log(LogLevel.WARN, message, metadata);
    }

    error(message: string, error?: any): void {
        this.log(LogLevel.ERROR, message, {
            error:
                error instanceof Error
                    ? {
                          name: error.name,
                          message: error.message,
                          stack: error.stack,
                      }
                    : error,
        });
    }
}
