import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import { setupDependencyInjection } from "./config/container.js";
import { DatabaseConnection } from "./infrastructure/database/DatabaseConnection.js";
import { Logger } from "./infrastructure/logging/Logger.js";
import { ENV } from "./config/env.js";
import { ErrorHandler } from "./presentation/middlewares/ErrorHandler.js";
import { apiRoutes } from "./presentation/routes/index.js";

// Setup DI Container
setupDependencyInjection();

const app = express();
const logger = container.resolve(Logger);
const dbConnection = container.resolve(DatabaseConnection);
const errorHandler = container.resolve(ErrorHandler);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info("Incoming request", {
        method: req.method,
        path: req.path,
        body: req.body,
    });
    next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
    const dbHealthy = await dbConnection.healthCheck();

    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? "healthy" : "unhealthy",
        database: dbHealthy ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: "Route not found",
            path: req.path,
        },
    });
});

// Error handling middleware
app.use(errorHandler.handle);

// Start server
async function startServer() {
    try {
        // Connect to database
        await dbConnection.connect();
        logger.info("Database connection established");

        // Start listening
        app.listen(ENV.PORT, () => {
            logger.info(`🚀 Server running on port ${ENV.PORT}`, {
                environment: ENV.NODE_ENV,
                port: ENV.PORT,
            });
            logger.info(`📍 API available at http://localhost:${ENV.PORT}/api`);
            logger.info(
                `🏥 Health check at http://localhost:${ENV.PORT}/health`,
            );
        });
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

// Signal Terminate (System, Docker, K8s)
process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await dbConnection.disconnect();
    process.exit(0);
});

// Signal Interrupt (Ctrl+C)
process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down gracefully");
    await dbConnection.disconnect();
    process.exit(0);
});

startServer();
