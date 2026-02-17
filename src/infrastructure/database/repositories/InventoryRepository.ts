import { IInventoryRepository } from "@application/interfaces/repositories/IInventoryRepository.js";
import { injectable, inject } from "tsyringe";
import { DatabaseConnection } from "../DatabaseConnection.js";
import { DI_TOKENS } from "@config/di-tokens.js";

@injectable()
export class InventoryRepository implements IInventoryRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection,
    ) {}
}