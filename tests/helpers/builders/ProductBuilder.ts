import { faker } from '@faker-js/faker';
import { Product } from '../../../src/domain/entities/Product.js';

export class ProductBuilder {
    private product: Product;

    constructor() {
        this.product = {
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.int({ min: 1000, max: 100000 }),
            categoryId: faker.string.uuid(),
            imageUrl: faker.image.url(),
            sku: faker.string.alphanumeric(10).toUpperCase(),
            isActive: true,
            metadata: {},
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    withId(id: string): this {
        this.product.id = id;
        return this;
    }

    withName(name: string): this {
        this.product.name = name;
        return this;
    }

    withPrice(price: number): this {
        this.product.price = price;
        return this;
    }

    withSku(sku: string): this {
        this.product.sku = sku;
        return this;
    }

    inactive(): this {
        this.product.isActive = false;
        return this;
    }

    build(): Product {
        return { ...this.product };
    }
}