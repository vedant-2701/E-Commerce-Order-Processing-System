import { inject, singleton } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IUserRepository } from '../../interfaces/repositories/IUserRepository.js';
import type { IOrderRepository } from '../../interfaces/repositories/IOrderRepository.js';
import { UserResponseDTO } from '../../dto/UserDTO.js';
import { OrderResponseDTO } from '../../dto/OrderResponseDTO.js';
import { NotFoundError } from '@shared/errors/NotFoundError.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { UserMapper } from '@application/mappers/UserMapper.js';
import { OrderMapper } from '@application/mappers/OrderMapper.js';

export interface UserWithOrdersDTO {
    user: UserResponseDTO;
    orders: OrderResponseDTO[];
    totalOrders: number;
    totalSpent: number;
}

@singleton()
export class GetUserWithOrdersUseCase {
    constructor(
        @inject(DI_TOKENS.IUserRepository)
        private readonly userRepository: IUserRepository,

        @inject(DI_TOKENS.IOrderRepository)
        private readonly orderRepository: IOrderRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(userId: string): Promise<UserWithOrdersDTO> {
        this.logger.info('Fetching user with orders', { userId });

        const [user, orders] = await Promise.all([
            this.userRepository.findById(userId),
            this.orderRepository.findByUserId(userId),
        ]);

        if (!user) {
            throw new NotFoundError('User', userId);
        }

        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
            user: UserMapper.toResponseDTO(user),
            orders: orders.map(OrderMapper.toResponseDTO),
            totalOrders: orders.length,
            totalSpent,
        };
    }
}