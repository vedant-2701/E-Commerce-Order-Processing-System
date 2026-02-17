import { AddToCartUseCase } from "@application/use-cases/cart/AddToCartUseCase.js";
import { GetCartUseCase } from "@application/use-cases/cart/GetCartUseCase.js";
import { RemoveFromCartUseCase } from "@application/use-cases/cart/RemoveFromCartUseCase.js";
import { DI_TOKENS } from "@config/di-tokens.js";
import { CartRepository } from "@infrastructure/database/repositories/CartRepository.js";
import { CartController } from "@presentation/controllers/CartController.js";
import { container } from "tsyringe";

export function registerCart() {
    // Repositories - Transient
    container.register(DI_TOKENS.ICartRepository, { useClass: CartRepository });

    // Cart Use Cases
    container.registerSingleton<AddToCartUseCase>(AddToCartUseCase);
    container.registerSingleton<RemoveFromCartUseCase>(RemoveFromCartUseCase);
    container.registerSingleton<GetCartUseCase>(GetCartUseCase);

    // Controllers - Singletons
    container.registerSingleton<CartController>(CartController);
}
