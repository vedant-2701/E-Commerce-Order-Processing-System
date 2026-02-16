import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { CreateCategoryUseCase } from "../../application/use-cases/category/CreateCategoryUseCase.js";
import { GetCategoriesUseCase } from "../../application/use-cases/category/GetCategoriesUseCase.js";
import { GetCategoryByIdUseCase } from "../../application/use-cases/category/GetCategoryByIdUseCase.js";
import { CreateCategoryDTO } from "../../application/dto/CategoryDTO.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Logger } from "../../infrastructure/logging/Logger.js";

@injectable()
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

        res.status(200).json({
            success: true,
            data: categories,
        });
    };

    getCategoryById = async (req: Request, res: Response): Promise<void> => {
        const { categoryId } = req.params;

        const category = await this.getCategoryByIdUseCase.execute(categoryId as string);

        res.status(200).json({
            success: true,
            data: category,
        });
    };

    createCategory = async (req: Request, res: Response): Promise<void> => {
        const dto: CreateCategoryDTO = {
            name: req.body.name,
            description: req.body.description,
        };

        const category = await this.createCategoryUseCase.execute(dto);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    };
}
