import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { GetUserByIdUseCase } from "../../application/use-cases/user/GetUserByIdUseCase.js";
import { GetUserWithOrdersUseCase } from "../../application/use-cases/user/GetUserWithOrdersUseCase.js";
import { UpdateUserUseCase } from "../../application/use-cases/user/UpdateUserUseCase.js";
import { UpdateUserDTO } from "../../application/dto/UserDTO.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Logger } from "../../infrastructure/logging/Logger.js";
import { CreateUserUseCase } from "@application/use-cases/user/CreateUserUseCase.js";

@injectable()
export class UserController {
    constructor(
        @inject(CreateUserUseCase)
        private readonly createUserUseCase: CreateUserUseCase,

        @inject(GetUserByIdUseCase)
        private readonly getUserByIdUseCase: GetUserByIdUseCase,

        @inject(GetUserWithOrdersUseCase)
        private readonly getUserWithOrdersUseCase: GetUserWithOrdersUseCase,

        @inject(UpdateUserUseCase)
        private readonly updateUserUseCase: UpdateUserUseCase,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger,
    ) {}

    createUser = async (req: Request, res: Response): Promise<void> => {
        const dto = req.body;

        const user = await this.createUserUseCase.execute(dto);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    };

    getUserById = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const user = await this.getUserByIdUseCase.execute(userId);

        res.status(200).json({
            success: true,
            data: user,
        });
    };

    getUserWithOrders = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const result = await this.getUserWithOrdersUseCase.execute(userId);

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    updateUser = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const dto: UpdateUserDTO = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
        };

        const user = await this.updateUserUseCase.execute(userId, dto);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    };
}
