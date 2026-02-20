import { Request, Response } from "express";
import { inject, singleton } from "tsyringe";
import { GetUserByIdUseCase } from "@application/use-cases/user/GetUserByIdUseCase.js";
import { GetUserWithOrdersUseCase } from "@application/use-cases/user/GetUserWithOrdersUseCase.js";
import { UpdateUserUseCase } from "@application/use-cases/user/UpdateUserUseCase.js";
import { UpdateUserDTO } from "@application/dto/UserDTO.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { Logger } from "@infrastructure/logging/Logger.js";
import { CreateUserUseCase } from "@application/use-cases/user/CreateUserUseCase.js";
import { ResponseHelper } from "@presentation/helpers/ResponseHelper.js";

@singleton()
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

        ResponseHelper.created(res, user, "User created successfully");
    };

    getUserById = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const user = await this.getUserByIdUseCase.execute(userId);
        
        ResponseHelper.success(res, user);
    };

    getUserWithOrders = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const result = await this.getUserWithOrdersUseCase.execute(userId);

        ResponseHelper.success(res, result);
    };

    updateUser = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params as { userId: string };

        const dto: UpdateUserDTO = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
        };

        const user = await this.updateUserUseCase.execute(userId, dto);

        ResponseHelper.success(res, user, "User updated successfully");
    };
}
