// config/container.ts
import "reflect-metadata";
import { container } from "tsyringe";
import { DI_TOKENS } from "./di-tokens.js";

// Infrastructure
import { DatabaseConnection } from "../infrastructure/database/DatabaseConnection.js";
import { Logger } from "../infrastructure/logging/Logger.js";

// Repositories
import { OrderRepository } from "../infrastructure/database/repositories/OrderRepository.js";
import { ProductRepository } from "../infrastructure/database/repositories/ProductRepository.js";
import { InventoryRepository } from "../infrastructure/database/repositories/InventoryRepository.js";
import { CartRepository } from "../infrastructure/database/repositories/CartRepository.js";
import { CategoryRepository } from "../infrastructure/database/repositories/CategoryRepository.js";

// Payment & Notifications
import { PaymentProcessorFactory } from "../infrastructure/payment/PaymentProcessorFactory.js";
import { CreditCardPaymentStrategy } from "../infrastructure/payment/strategies/CreditCardPaymentStrategy.js";
import { PayPalPaymentStrategy } from "../infrastructure/payment/strategies/PayPalPaymentStrategy.js";
import { NotificationService } from "../infrastructure/notifications/NotificationService.js";
import { EmailNotificationStrategy } from "../infrastructure/notifications/strategies/EmailNotificationStrategy.js";
import { SmsNotificationStrategy } from "../infrastructure/notifications/strategies/SmsNotificationStrategy.js";

// Use Cases - Order
import { PlaceOrderUseCase } from "../application/use-cases/order/PlaceOrderUseCase.js";
import { GetOrderHistoryUseCase } from "../application/use-cases/order/GetOrderHistoryUseCase.js";
import { GetOrderByIdUseCase } from "../application/use-cases/order/GetOrderByIdUseCase.js";

// Use Cases - Cart
import { AddToCartUseCase } from "../application/use-cases/cart/AddToCartUseCase.js";
import { RemoveFromCartUseCase } from "../application/use-cases/cart/RemoveFromCartUseCase.js";
import { GetCartUseCase } from "../application/use-cases/cart/GetCartUseCase.js";

// Use Cases - Product
import { CreateProductUseCase } from "../application/use-cases/product/CreateProductUseCase.js";
import { GetProductsUseCase } from "../application/use-cases/product/GetProductsUseCase.js";
import { GetProductByIdUseCase } from "../application/use-cases/product/GetProductByIdUseCase.js";

// Use Cases - Category
import { CreateCategoryUseCase } from "@application/use-cases/category/CreateCategoryUseCase.js";
import { GetCategoriesUseCase } from "@application/use-cases/category/GetCategoriesUseCase.js";
import { GetCategoryByIdUseCase } from "@application/use-cases/category/GetCategoryByIdUseCase.js";

// Controllers
import { OrderController } from "../presentation/controllers/OrderController.js";
import { CartController } from "../presentation/controllers/CartController.js";
import { ProductController } from "../presentation/controllers/ProductController.js";
import { CategoryController } from "@presentation/controllers/CategoryController.js";

// Middleware
import { ErrorHandler } from "../presentation/middlewares/ErrorHandler.js";

export function setupDependencyInjection(): void {
    // Infrastructure - Singletons
    container.registerSingleton<Logger>(DI_TOKENS.Logger, Logger);
    container.registerSingleton<DatabaseConnection>(DI_TOKENS.DatabaseConnection, DatabaseConnection);

    // Repositories - Transient
    container.register(DI_TOKENS.IOrderRepository, { useClass: OrderRepository });
    container.register(DI_TOKENS.IProductRepository, { useClass: ProductRepository });
    container.register(DI_TOKENS.IInventoryRepository, { useClass: InventoryRepository });
    container.register(DI_TOKENS.ICartRepository, { useClass: CartRepository });
    container.register(DI_TOKENS.ICategoryRepository, { useClass: CategoryRepository });

    // Payment Strategies - Singletons
    container.registerSingleton<CreditCardPaymentStrategy>(CreditCardPaymentStrategy);
    container.registerSingleton<PayPalPaymentStrategy>(PayPalPaymentStrategy);
    container.registerSingleton<PaymentProcessorFactory>(PaymentProcessorFactory);

    // Notification Strategies - Singletons
    container.registerSingleton<EmailNotificationStrategy>(EmailNotificationStrategy);
    container.registerSingleton<SmsNotificationStrategy>(SmsNotificationStrategy);
    container.registerSingleton<NotificationService>(NotificationService);

    // Use Cases - Singletons
    // Order Use Cases
    container.registerSingleton<PlaceOrderUseCase>(PlaceOrderUseCase);
    container.registerSingleton<GetOrderHistoryUseCase>(GetOrderHistoryUseCase);
    container.registerSingleton<GetOrderByIdUseCase>(GetOrderByIdUseCase);

    // Cart Use Cases
    container.registerSingleton<AddToCartUseCase>(AddToCartUseCase);
    container.registerSingleton<RemoveFromCartUseCase>(RemoveFromCartUseCase);
    container.registerSingleton<GetCartUseCase>(GetCartUseCase);

    // Products Use Cases
    container.registerSingleton<CreateProductUseCase>(CreateProductUseCase);
    container.registerSingleton<GetProductsUseCase>(GetProductsUseCase);
    container.registerSingleton<GetProductByIdUseCase>(GetProductByIdUseCase);

    // Categories Use Cases
    container.registerSingleton<CreateCategoryUseCase>(CreateCategoryUseCase);
    container.registerSingleton<GetCategoriesUseCase>(GetCategoriesUseCase);
    container .registerSingleton<GetCategoryByIdUseCase>(GetCategoryByIdUseCase);

    // Controllers - Singletons
    container.registerSingleton<OrderController>(OrderController);
    container.registerSingleton<CartController>(CartController);
    container.registerSingleton<ProductController>(ProductController);
    container.registerSingleton<CategoryController>(CategoryController);

    // Middleware - Singletons
    container.registerSingleton<ErrorHandler>(ErrorHandler);
}