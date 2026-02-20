import { Order } from '@domain/entities/Order.js';
import { OrderResponseDTO } from '../dto/OrderResponseDTO.js';
import { ItemMapper } from './ItemMapper.js';

export class OrderMapper {
    static toResponseDTO(order: Order): OrderResponseDTO {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            items: order.items.map(ItemMapper.toResponseDTO),
        };
    }
}