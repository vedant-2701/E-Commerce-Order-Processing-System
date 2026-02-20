import { singleton, inject } from "tsyringe";
import type { IOrderRepository } from "../../interfaces/repositories/IOrderRepository.js";
import { OrderResponseDTO } from "../../dto/OrderResponseDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { OrderMapper } from "@application/mappers/OrderMapper.js";

@singleton()
export class GetOrderHistoryUseCase {
    constructor(
        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,
        
        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    async execute(
        userId: string,
        limit: number = 50,
    ): Promise<OrderResponseDTO[]> {
        this.logger.info("Fetching order history", { userId, limit });

        const orders = await this.orderRepository.findByUserId(userId, limit);

        return orders.map(OrderMapper.toResponseDTO);
    }
}
