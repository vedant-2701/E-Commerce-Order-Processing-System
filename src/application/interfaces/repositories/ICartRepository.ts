import type { Cart } from "@domain/entities/Cart.js";
import type { CartItem } from "@domain/entities/CartItem.js";

export interface ICartRepository {
    findByUserId(userId: string): Promise<Cart | null>;
    create(cart: Cart): Promise<Cart>;
    addItem(cartId: string, item: CartItem): Promise<void>;
    removeItem(cartId: string, productId: string): Promise<void>;
    updateItemQuantity(
        cartId: string,
        productId: string,
        quantity: number,
    ): Promise<void>;
    clearCart(cartId: string): Promise<void>;
    delete(cartId: string): Promise<void>;
}
