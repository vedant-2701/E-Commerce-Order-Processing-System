import { singleton, inject } from "tsyringe";
import type { IOrderRepository } from "../../interfaces/repositories/IOrderRepository.js";
import { Order } from "@domain/entities/Order.js";
import { NotFoundError } from "@shared/errors/NotFoundError.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@singleton()
export class GetOrderByIdUseCase {
    constructor(
        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(orderId: string): Promise<Order> {
        this.logger.info("Fetching order by ID", { orderId });

        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundError("Order", orderId);
        }

        return order;
    }
}
