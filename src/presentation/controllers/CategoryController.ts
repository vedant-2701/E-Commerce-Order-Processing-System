import { Request, Response } from "express";
import { singleton, inject } from "tsyringe";
import { CreateCategoryUseCase } from "@application/use-cases/category/CreateCategoryUseCase.js";
import { GetCategoriesUseCase } from "@application/use-cases/category/GetCategoriesUseCase.js";
import { GetCategoryByIdUseCase } from "@application/use-cases/category/GetCategoryByIdUseCase.js";
import { CreateCategoryDTO } from "@application/dto/CategoryDTO.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { ResponseHelper } from "@presentation/helpers/ResponseHelper.js";

@singleton()
export class CategoryController {
    constructor(
        @inject(CreateCategoryUseCase)
        private readonly createCategoryUseCase: CreateCategoryUseCase,

        @inject(GetCategoriesUseCase)
        private readonly getCategoriesUseCase: GetCategoriesUseCase,

        @inject(GetCategoryByIdUseCase)
        private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,

        @inject(DI_TOKENS.Logger) 
        private readonly logger: Logger,
    ) {}

    getCategories = async (req: Request, res: Response): Promise<void> => {
        const categories = await this.getCategoriesUseCase.execute();

        ResponseHelper.success(res, categories);
    };

    getCategoryById = async (req: Request, res: Response): Promise<void> => {
        const { categoryId } = req.params;

        const category = await this.getCategoryByIdUseCase.execute(categoryId as string);

        ResponseHelper.success(res, category);
    };

    createCategory = async (req: Request, res: Response): Promise<void> => {
        const dto: CreateCategoryDTO = {
            name: req.body.name,
            description: req.body.description,
        };

        const category = await this.createCategoryUseCase.execute(dto);

        ResponseHelper.created(res, category, "Category created successfully");
    };
}
