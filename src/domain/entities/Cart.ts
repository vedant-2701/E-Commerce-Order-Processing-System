import type { CartItem } from "./CartItem.js";

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}
