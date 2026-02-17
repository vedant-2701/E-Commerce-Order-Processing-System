import { GetOrderByIdUseCase } from "@application/use-cases/order/GetOrderByIdUseCase.js";
import { GetOrderHistoryUseCase } from "@application/use-cases/order/GetOrderHistoryUseCase.js";
import { PlaceOrderUseCase } from "@application/use-cases/order/PlaceOrderUseCase.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { OrderFactory } from "@domain/factories/OrderFactory.js";
import { InventoryService } from "@domain/services/order/InventoryService.js";
import { OrderPricingService } from "@domain/services/order/OrderPricingService.js";
import { OrderValidationService } from "@domain/services/order/OrderValidationService.js";
import { PaymentService } from "@domain/services/payment/PaymentService.js";
import { OrderRepository } from "@infrastructure/database/repositories/OrderRepository.js";
import { OrderController } from "@presentation/controllers/OrderController.js";
import { container } from "tsyringe";

export function registerOrder() {
    // Repositories - Transient
    container.register(DI_TOKENS.IOrderRepository, {
        useClass: OrderRepository,
    });

    // Domain Services - Singletons
    container.registerSingleton<OrderValidationService>(OrderValidationService);
    container.registerSingleton<OrderPricingService>(OrderPricingService);
    container.registerSingleton<OrderFactory>(OrderFactory);
    container.registerSingleton<InventoryService>(InventoryService);
    container.registerSingleton<PaymentService>(PaymentService);

    // Order Use Cases
    container.registerSingleton<PlaceOrderUseCase>(PlaceOrderUseCase);
    container.registerSingleton<GetOrderHistoryUseCase>(GetOrderHistoryUseCase);
    container.registerSingleton<GetOrderByIdUseCase>(GetOrderByIdUseCase);

    // Controllers - Singletons
    container.registerSingleton<OrderController>(OrderController);
}
