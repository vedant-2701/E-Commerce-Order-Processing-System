// import "reflect-metadata";
// import { container } from "tsyringe";

// // Database
// import { DatabaseConnection } from "../infrastructure/database/DatabaseConnection.js";

// // Repositories
// import { IOrderRepository } from "../application/interfaces/repositories/IOrderRepository.js";
// import { OrderRepository } from "../infrastructure/database/repositories/OrderRepository.js";
// import { IProductRepository } from "../application/interfaces/repositories/IProductRepository.js";
// import { ProductRepository } from "../infrastructure/database/repositories/ProductRepository.js";
// import { IInventoryRepository } from "../application/interfaces/repositories/IInventoryRepository.js";
// import { InventoryRepository } from "../infrastructure/database/repositories/InventoryRepository.js";
// import { ICartRepository } from "../application/interfaces/repositories/ICartRepository.js";
// import { CartRepository } from "../infrastructure/database/repositories/CartRepository.js";

// // Services
// import { IUnitOfWork } from "../application/interfaces/IUnitOfWork.js";
// import { UnitOfWork } from "../infrastructure/database/UnitOfWork.js";
// import { IInventoryLockService } from "../application/interfaces/services/IInventoryLockService.js";
// import { RedisInventoryLockService } from "../infrastructure/services/RedisInventoryLockService.js";

// // Payment & Notifications
// import { PaymentProcessorFactory } from "../infrastructure/payment/PaymentProcessorFactory.js";
// import { CreditCardPaymentStrategy } from "../infrastructure/payment/strategie.jss/CreditCardPaymentStrategy";
// import { PayPalPaymentStrategy } from "../infrastructure/payment/strategies/PayPalPaymentStrategy.js";
// import { NotificationService } from "../infrastructure/notifications/NotificationService.js";
// import { EmailNotificationStrategy } from "../infrastructure/notifications/strategie.jss/EmailNotificationStrategy";
// import { SmsNotificationStrategy } from "../infrastructure/notifications/strategie.jss/SmsNotificationStrategy";

// // Use Cases - Order
// import { PlaceOrderUseCase } from "../application/use-cases/order/PlaceOrderUseCase.js";
// import { GetOrderHistoryUseCase } from "../application/use-cases/order/GetOrderHistoryUseCase.js";
// import { GetOrderByIdUseCase } from "../application/use-cases/order/GetOrderByIdUseCase.js";

// // Use Cases - Cart
// import { AddToCartUseCase } from "../application/use-cases/cart/AddToCartUseCase.js";
// import { RemoveFromCartUseCase } from "../application/use-cases/cart/RemoveFromCartUseCase.js";
// import { GetCartUseCase } from "../application/use-cases/cart/GetCartUseCase.js";

// // Use Cases - Product
// import { CreateProductUseCase } from "../application/use-cases/product/CreateProductUseCase.js";
// import { GetProductsUseCase } from "../application/use-cases/product/GetProductsUseCase.js";
// import { GetProductByIdUseCase } from "../application/use-cases/product/GetProductByIdUseCase.js";

// // Controllers
// import { OrderController } from "../presentation/controllers/OrderController.js";
// import { CartController } from "../presentation/controllers/CartController.js";
// import { ProductController } from "../presentation/controllers/ProductController.js";

// // Middleware
// import { ErrorHandler } from "../presentation/middlewares/ErrorHandler.js";

// // Infrastructure
// import { Logger } from "../infrastructure/logging/Logger.js";

// export function setupDependencyInjection(): void {
//     // Singleton services
//     container.registerSingleton<Logger>(Logger);
//     container.registerSingleton<DatabaseConnection>(DatabaseConnection);

//     // Repositories
//     container.register<IOrderRepository>("IOrderRepository", {
//         useClass: OrderRepository,
//     });
//     container.register<IProductRepository>("IProductRepository", {
//         useClass: ProductRepository,
//     });
//     container.register<IInventoryRepository>("IInventoryRepository", {
//         useClass: InventoryRepository,
//     });
//     container.register<ICartRepository>("ICartRepository", {
//         useClass: CartRepository,
//     });

//     // Services
//     container.register<IUnitOfWork>("IUnitOfWork", {
//         useClass: UnitOfWork,
//     });
//     container.register<IInventoryLockService>("IInventoryLockService", {
//         useClass: RedisInventoryLockService,
//     });

//     // Payment strategies
//     container.registerSingleton<CreditCardPaymentStrategy>(
//         CreditCardPaymentStrategy,
//     );
//     container.registerSingleton<PayPalPaymentStrategy>(PayPalPaymentStrategy);
//     container.registerSingleton<PaymentProcessorFactory>(
//         PaymentProcessorFactory,
//     );

//     // Notification strategies
//     container.registerSingleton<EmailNotificationStrategy>(
//         EmailNotificationStrategy,
//     );
//     container.registerSingleton<SmsNotificationStrategy>(
//         SmsNotificationStrategy,
//     );
//     container.registerSingleton<NotificationService>(NotificationService);

//     // Use Cases - Order
//     container.registerSingleton<PlaceOrderUseCase>(PlaceOrderUseCase);
//     container.registerSingleton<GetOrderHistoryUseCase>(GetOrderHistoryUseCase);
//     container.registerSingleton<GetOrderByIdUseCase>(GetOrderByIdUseCase);

//     // Use Cases - Cart
//     container.registerSingleton<AddToCartUseCase>(AddToCartUseCase);
//     container.registerSingleton<RemoveFromCartUseCase>(RemoveFromCartUseCase);
//     container.registerSingleton<GetCartUseCase>(GetCartUseCase);

//     // Use Cases - Product
//     container.registerSingleton<CreateProductUseCase>(CreateProductUseCase);
//     container.registerSingleton<GetProductsUseCase>(GetProductsUseCase);
//     container.registerSingleton<GetProductByIdUseCase>(GetProductByIdUseCase);

//     // Controllers
//     container.registerSingleton<OrderController>(OrderController);
//     container.registerSingleton<CartController>(CartController);
//     container.registerSingleton<ProductController>(ProductController);

//     // Middleware
//     container.registerSingleton<ErrorHandler>(ErrorHandler);
// }


import "reflect-metadata";
import { container } from "tsyringe";

// Database
import { DatabaseConnection } from "../infrastructure/database/DatabaseConnection.js";
import { Logger } from "../infrastructure/logging/Logger.js";
import { DI_TOKENS } from "./di-tokens.js";
import { ErrorHandler } from "@presentation/middlewares/ErrorHandler.js";

export function setupDependencyInjection(): void {
    // Singleton services
    container.registerSingleton<Logger>(DI_TOKENS.Logger, Logger);
    container.registerSingleton<DatabaseConnection>(
        DI_TOKENS.DatabaseConnection,
        DatabaseConnection
    );
    container.registerSingleton<ErrorHandler>(ErrorHandler);
}