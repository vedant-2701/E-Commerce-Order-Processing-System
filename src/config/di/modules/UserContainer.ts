import { CreateUserUseCase } from "@application/use-cases/user/CreateUserUseCase.js";
import { GetUserByIdUseCase } from "@application/use-cases/user/GetUserByIdUseCase.js";
import { GetUserWithOrdersUseCase } from "@application/use-cases/user/GetUserWithOrdersUseCase.js";
import { UpdateUserUseCase } from "@application/use-cases/user/UpdateUserUseCase.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { UserRepository } from "@infrastructure/database/repositories/UserRepository.js";
import { UserController } from "@presentation/controllers/UserController.js";
import { container } from "tsyringe";

export function registerUser(): void {
    // Repositories - Transient
    container.register(DI_TOKENS.IUserRepository, { useClass: UserRepository });
    
    // User Use Cases
    container.registerSingleton<GetUserByIdUseCase>(GetUserByIdUseCase);
    container.registerSingleton<GetUserWithOrdersUseCase>(
        GetUserWithOrdersUseCase,
    );
    container.registerSingleton<UpdateUserUseCase>(UpdateUserUseCase);
    container.registerSingleton<CreateUserUseCase>(CreateUserUseCase);

    // Controllers - Singletons
    container.registerSingleton<UserController>(UserController);
}
