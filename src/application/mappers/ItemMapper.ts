export class ItemMapper {
    static toResponseDTO(item: any): any {
        return {
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
        };
    }
}