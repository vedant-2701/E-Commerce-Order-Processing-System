import type { User } from "@domain/entities/User.js";

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(user: User): Promise<User>;
    delete(id: string): Promise<void>;
}
