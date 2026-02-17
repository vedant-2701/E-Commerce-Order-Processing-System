import { IProductRepository } from "@application/interfaces/repositories/IProductRepository.js";
import { injectable, inject } from "tsyringe";
import { DatabaseConnection } from "../DatabaseConnection.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Product } from "@domain/entities/Product.js";

@injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async create(product: Product): Promise<Product> {
        const created = await this.prisma.product.create({
            data: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                categoryId: product.categoryId,
                imageUrl: product.imageUrl ?? undefined,
                sku: product.sku,
                isActive: product.isActive,
                metadata: (product.metadata as any) ?? undefined,
            },
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        return product ? this.toDomain(product) : null;
    }

    async findBySku(sku: string): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { sku },
        });

        return product ? this.toDomain(product) : null;
    }

    async findAll(filters?: {
        categoryId?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                ...(filters?.categoryId && { categoryId: filters.categoryId }),
                ...(filters?.isActive !== undefined && {
                    isActive: filters.isActive,
                }),
            },
            ...(filters?.limit && { take: filters.limit }),
            ...(filters?.offset && { skip: filters.offset }),
        });

        return products.map(this.toDomain);
    }

    async update(product: Product): Promise<Product> {
        const updated = await this.prisma.product.update({
            where: { id: product.id },
            data: {
                name: product.name,
                description: product.description,
                price: product.price,
                categoryId: product.categoryId,
                imageUrl: product.imageUrl,
                isActive: product.isActive,
                metadata: product.metadata as any,
            },
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.product.delete({
            where: { id },
        });
    }

    private toDomain(prismaProduct: any): Product {
        return {
            id: prismaProduct.id,
            name: prismaProduct.name,
            description: prismaProduct.description,
            price: prismaProduct.price,
            categoryId: prismaProduct.categoryId,
            imageUrl: prismaProduct.imageUrl ?? undefined,
            sku: prismaProduct.sku,
            isActive: prismaProduct.isActive,
            metadata: prismaProduct.metadata ?? undefined,
            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
        };
    }
}
