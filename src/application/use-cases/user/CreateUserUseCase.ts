import { inject, singleton } from 'tsyringe';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { DI_TOKENS } from '@config/di-tokens.js';
import { CreateUserDTO, UserResponseDTO } from '../../dto/UserDTO.js';
import type { IUserRepository } from '../../interfaces/repositories/IUserRepository.js';
import { User } from '@domain/entities/User.js';
import { ValidationError } from '@shared/errors/ValidationError.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { UserMapper } from '@application/mappers/UserMapper.js';

@singleton()
export class CreateUserUseCase {
    private readonly SALT_ROUNDS = 10;

    constructor(
        @inject(DI_TOKENS.IUserRepository)
        private readonly userRepository: IUserRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
        this.logger.info('Creating user', { email: dto.email });

        // Check if user already exists
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new ValidationError(`User with email '${dto.email}' already exists`);
        }

        // Hash password
        const passwordHash = await hash(dto.password, this.SALT_ROUNDS);

        // Create user entity
        const user: User = {
            id: uuidv4(),
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            password: passwordHash,
            phone: dto.phone ?? undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const created = await this.userRepository.create(user);

        this.logger.info('User created successfully', {
            userId: created.id,
            email: created.email,
        });

        return UserMapper.toResponseDTO(created);
    }
}
