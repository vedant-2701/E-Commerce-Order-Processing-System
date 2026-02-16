import { config } from "dotenv";

config();

export const ENV = {
    // Server
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000", 10),

    // Database
    DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://user:password@localhost:5432/ecommerce",

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || "info",

} as const;
