import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import { Cart } from '@domain/entities/Cart.js';
import { CartItem } from '@domain/entities/CartItem.js';
import { ICartRepository } from '@application/interfaces/repositories/ICartRepository.js';
import { DatabaseConnection } from '../DatabaseConnection.js';

@injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection) private readonly dbConnection: DatabaseConnection
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async findByUserId(userId: string): Promise<Cart | null> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: true,
            },
        });

        return cart ? this.toDomain(cart) : null;
    }

    async create(cart: Cart): Promise<Cart> {
        const created = await this.prisma.cart.create({
            data: {
                id: cart.id,
                userId: cart.userId,
            },
            include: {
                items: true,
            },
        });

        return this.toDomain(created);
    }

    async addItem(cartId: string, item: CartItem): Promise<void> {
        await this.prisma.cartItem.create({
            data: {
                id: item.id,
                cartId: cartId,
                productId: item.productId,
                quantity: item.quantity,
            },
        });
    }

    async removeItem(cartId: string, productId: string): Promise<void> {
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cartId,
                productId: productId,
            },
        });
    }

    async updateItemQuantity(
        cartId: string,
        productId: string,
        quantity: number
    ): Promise<void> {
        await this.prisma.cartItem.updateMany({
            where: {
                cartId: cartId,
                productId: productId,
            },
            data: {
                quantity: quantity,
            },
        });
    }

    async clearCart(cartId: string): Promise<void> {
        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }

    async delete(cartId: string): Promise<void> {
        await this.prisma.cart.delete({
            where: { id: cartId },
        });
    }

    private toDomain(prismaCart: any): Cart {
        return {
            id: prismaCart.id,
            userId: prismaCart.userId,
            items: prismaCart.items?.map((item: any) => ({
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                quantity: item.quantity,
                addedAt: item.addedAt,
            })) || [],
            createdAt: prismaCart.createdAt,
            updatedAt: prismaCart.updatedAt,
        };
    }
}