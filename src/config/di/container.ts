import "reflect-metadata";
import {
    registerInfrastructure,
    registerOrder,
    registerCart,
    registerProduct,
    registerCategory,
    registerUser,
} from "./modules/index.js";

export function setupDependencyInjection(): void {
    registerInfrastructure();
    registerOrder();
    registerCart();
    registerProduct();
    registerCategory();
    registerUser();
}