import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import { User } from '@domain/entities/User.js';
import { IUserRepository } from '@application/interfaces/repositories/IUserRepository.js';
import { DatabaseConnection } from '../DatabaseConnection.js';

@injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @inject(DI_TOKENS.DatabaseConnection)
        private readonly dbConnection: DatabaseConnection
    ) {}

    private get prisma() {
        return this.dbConnection.getClient();
    }

    async create(user: User): Promise<User> {
        const created = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password,
                phone: user.phone ?? undefined,
            },
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? this.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? this.toDomain(user) : null;
    }

    async update(user: User): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                ...(user.phone !== undefined && { phone: user.phone }),
            },
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    private toDomain(prismaUser: any): User {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            firstName: prismaUser.firstName,
            lastName: prismaUser.lastName,
            password: prismaUser.password,
            phone: prismaUser.phone ?? undefined,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        };
    }
}