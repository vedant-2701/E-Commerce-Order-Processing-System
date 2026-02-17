import { ICartRepository } from "@application/interfaces/repositories/ICartRepository.js";
import { injectable, inject } from "tsyringe";
import { DatabaseConnection } from "../DatabaseConnection.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class CartRepository implements ICartRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}
}