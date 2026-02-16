export interface AddToCartDTO {
    userId: string;
    productId: string;
    quantity: number;
}

export interface RemoveFromCartDTO {
    userId: string;
    productId: string;
}

export interface CartResponseDTO {
    id: string;
    userId: string;
    items: Array<{
        id: string;
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
    }>;
    totalItems: number;
    totalAmount: number;
}