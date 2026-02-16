import { injectable, inject } from "tsyringe";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Category } from "../../../domain/entities/Category.js";
import { ICategoryRepository } from "../../../application/interfaces/repositories/ICategoryRepository.js";
import { DatabaseConnection } from "../DatabaseConnection.js";

@injectable()
export class CategoryRepository implements ICategoryRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async create(category: Category): Promise<Category> {
        const created = await this.prisma.category.create({
            data: {
                id: category.id,
                name: category.name,
                description: category.description ?? "No Description",
            },
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        return category ? this.toDomain(category) : null;
    }

    async findByName(name: string): Promise<Category | null> {
        const category = await this.prisma.category.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
            },
        });

        return category ? this.toDomain(category) : null;
    }

    async findAll(): Promise<Category[]> {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: "asc" },
        });

        return categories.map(this.toDomain);
    }

    async update(category: Category): Promise<Category> {
        const updated = await this.prisma.category.update({
            where: { id: category.id },
            data: {
                name: category.name,
                description: category.description ?? "No Description",
            },
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.category.delete({
            where: { id },
        });
    }

    async getProductCount(categoryId: string): Promise<number> {
        return await this.prisma.product.count({
            where: { categoryId },
        });
    }

    private toDomain(prismaCategory: any): Category {
        return {
            id: prismaCategory.id,
            name: prismaCategory.name,
            description: prismaCategory.description ?? "No Description",
            createdAt: prismaCategory.createdAt,
            updatedAt: prismaCategory.updatedAt,
        };
    }
}
