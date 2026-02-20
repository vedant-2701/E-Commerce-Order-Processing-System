import { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { CreateProductUseCase } from "@application/use-cases/product/CreateProductUseCase.js";
import { GetProductsUseCase } from "@application/use-cases/product/GetProductsUseCase.js";
import { GetProductByIdUseCase } from "@application/use-cases/product/GetProductByIdUseCase.js";
import { CreateProductDTO } from "@application/dto/ProductDTO.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { ResponseHelper } from "@presentation/helpers/ResponseHelper.js";

@singleton()
export class ProductController {
    constructor(
        @inject(CreateProductUseCase)
        private readonly createProductUseCase: CreateProductUseCase,

        @inject(GetProductsUseCase)
        private readonly getProductsUseCase: GetProductsUseCase,

        @inject(GetProductByIdUseCase)
        private readonly getProductByIdUseCase: GetProductByIdUseCase,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    getProducts = async (req: Request, res: Response): Promise<void> => {
        const filters = {
            ...(req.query.categoryId !== undefined && {
                categoryId: req.query.categoryId as string,
            }),
            ...(req.query.isActive !== undefined && {
                isActive: req.query.isActive === "true",
            }),
            limit: parseInt(req.query.limit as string) || 50,
            offset: parseInt(req.query.offset as string) || 0,
        };

        const products = await this.getProductsUseCase.execute(filters);

        ResponseHelper.success(res, products);
    };

    getProductById = async (req: Request, res: Response): Promise<void> => {
        const { productId } = req.params;

        const product = await this.getProductByIdUseCase.execute(
            productId as string,
        );

        ResponseHelper.success(res, product);
    };

    createProduct = async (req: Request, res: Response): Promise<void> => {
        const dto: CreateProductDTO = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            categoryId: req.body.categoryId,
            imageUrl: req.body.imageUrl,
            sku: req.body.sku,
            metadata: req.body.metadata,
            initialStock: req.body.initialStock || 0,
        };

        const product = await this.createProductUseCase.execute(dto);

        ResponseHelper.created(res, product, "Product created successfully");
    };
}
