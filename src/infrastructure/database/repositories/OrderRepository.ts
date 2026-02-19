import { IOrderRepository } from "@application/interfaces/repositories/IOrderRepository.js";
import { inject, singleton } from "tsyringe";
import { DatabaseConnection } from "../DatabaseConnection.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Order } from "@domain/entities/Order.js";
import { Prisma } from "generated/prisma/client.js";
import type { TransactionContext } from "@application/interfaces/repositories/IInventoryRepository.js";

@singleton()
export class OrderRepository implements IOrderRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async create(order: Order, tx?: TransactionContext): Promise<Order> {
        const client = (tx as Prisma.TransactionClient) ?? this.prisma;

        const created = await client.order.create({
            data: {
                id: order.id,
                userId: order.userId,
                orderNumber: order.orderNumber,
                status: order.status,
                subtotal: order.subtotal,
                tax: order.tax,
                shippingCost: order.shippingCost,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                notes: order.notes ?? null,
                items: {
                    create: order.items.map(item => ({
                        id: item.id,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        subtotal: item.subtotal,
                    })),
                },
                payment: order.payment ? {
                    create: {
                        id: order.payment.id,
                        amount: order.payment.amount,
                        method: order.payment.method,
                        status: order.payment.status,
                        ...(order.payment.transactionId && { transactionId: order.payment.transactionId }),
                        ...(order.payment.failureReason && { failureReason: order.payment.failureReason }),
                        ...(order.payment.processedAt && { processedAt: order.payment.processedAt }),
                    },
                } : undefined,
            },
            include: {
                items: true,
                payment: true,
            },
        });
        return this.toDomain(created);
    }

    async findById(id: string): Promise<Order | null> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
                payment: true,
            },
        });

        return order ? this.toDomain(order) : null;
    }

    async findByUserId(userId: string, limit?: number): Promise<Order[]> {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: {
                items: true,
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            ...(limit && { take: limit }),
        });

        return orders.map(this.toDomain);
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: true,
                payment: true,
            },
        });

        return order ? this.toDomain(order) : null;
    }

    async update(order: Order): Promise<Order> {
        const updated = await this.prisma.order.update({
            where: { id: order.id },
            data: {
                status: order.status,
                subtotal: order.subtotal,
                tax: order.tax,
                shippingCost: order.shippingCost,
                totalAmount: order.totalAmount,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                notes: order.notes,
            },
            include: {
                items: true,
                payment: true,
            },
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.order.delete({
            where: { id },
        });
    }

    private toDomain(prismaOrder: any): Order {
        return {
            id: prismaOrder.id,
            userId: prismaOrder.userId,
            orderNumber: prismaOrder.orderNumber,
            status: prismaOrder.status,
            subtotal: prismaOrder.subtotal,
            tax: prismaOrder.tax,
            shippingCost: prismaOrder.shippingCost,
            totalAmount: prismaOrder.totalAmount,
            shippingAddress: prismaOrder.shippingAddress,
            billingAddress: prismaOrder.billingAddress,
            notes: prismaOrder.notes,
            createdAt: prismaOrder.createdAt,
            updatedAt: prismaOrder.updatedAt,
            items: prismaOrder.items?.map((item: any) => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
            })) || [],
            payment: prismaOrder.payment ? {
                id: prismaOrder.payment.id,
                orderId: prismaOrder.payment.orderId,
                amount: prismaOrder.payment.amount,
                method: prismaOrder.payment.method,
                status: prismaOrder.payment.status,
                ...(prismaOrder.payment.transactionId && { transactionId: prismaOrder.payment.transactionId }),
                ...(prismaOrder.payment.failureReason && { failureReason: prismaOrder.payment.failureReason }),
                ...(prismaOrder.payment.processedAt && { processedAt: prismaOrder.payment.processedAt }),
                createdAt: prismaOrder.payment.createdAt,
            } : undefined,
        };
    }
}