import { singleton, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { DI_TOKENS } from "@config/di-tokens.js";
import { CreateCategoryDTO } from "../../dto/CategoryDTO.js";
import type { ICategoryRepository } from "../../interfaces/repositories/ICategoryRepository.js";
import { Category } from "@domain/entities/Category.js";
import { ValidationError } from "@shared/errors/ValidationError.js";
import { Logger } from "@infrastructure/logging/Logger.js";

@singleton()
export class CreateCategoryUseCase {
    constructor(
        @inject(DI_TOKENS.ICategoryRepository)
        private readonly categoryRepository: ICategoryRepository,

        @inject(DI_TOKENS.Logger) 
        private readonly logger: Logger,
    ) {}

    async execute(dto: CreateCategoryDTO): Promise<Category> {
        this.logger.info("Creating category", { name: dto.name });

        const existing = await this.categoryRepository.findByName(dto.name);
        if (existing) {
            throw new ValidationError(`Category '${dto.name}' already exists`);
        }

        const category: Category = {
            id: uuidv4(),
            name: dto.name,
            description: dto.description ?? undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const created = await this.categoryRepository.create(category);

        this.logger.info("Category created successfully", {
            categoryId: created.id,
        });

        return created;
    }
}
