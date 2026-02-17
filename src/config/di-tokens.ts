export const DI_TOKENS = {
    // Infrastructure
    Logger: Symbol.for("Logger"),
    DatabaseConnection: Symbol.for("DatabaseConnection"),

    // Repositories
    IOrderRepository: Symbol.for("IOrderRepository"),
    IProductRepository: Symbol.for("IProductRepository"),
    IInventoryRepository: Symbol.for("IInventoryRepository"),
    ICartRepository: Symbol.for("ICartRepository"),
    ICategoryRepository: Symbol.for('ICategoryRepository'),
    IUserRepository: Symbol.for('IUserRepository'),

} as const;
