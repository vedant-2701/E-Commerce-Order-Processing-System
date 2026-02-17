import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IUserRepository } from '../../interfaces/repositories/IUserRepository.js';
import type { IOrderRepository } from '../../interfaces/repositories/IOrderRepository.js';
import { UserResponseDTO } from '../../dto/UserDTO.js';
import { OrderResponseDTO } from '../../dto/OrderResponseDTO.js';
import { NotFoundError } from '@shared/errors/NotFoundError.js';
import { Logger } from '@infrastructure/logging/Logger.js';

export interface UserWithOrdersDTO {
    user: UserResponseDTO;
    orders: OrderResponseDTO[];
    totalOrders: number;
    totalSpent: number;
}

@injectable()
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
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                createdAt: user.createdAt,
            },
            orders: orders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                items: order.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal,
                })),
            })),
            totalOrders: orders.length,
            totalSpent,
        };
    }
}