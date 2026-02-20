import { inject, singleton } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IUserRepository } from '../../interfaces/repositories/IUserRepository.js';
import { UserResponseDTO } from '../../dto/UserDTO.js';
import { NotFoundError } from '@shared/errors/NotFoundError.js';
import { Logger } from '@infrastructure/logging/Logger.js';
import { User } from '@domain/entities/User.js';
import { UserMapper } from '@application/mappers/UserMapper.js';

@singleton()
export class GetUserByIdUseCase {
    constructor(
        @inject(DI_TOKENS.IUserRepository)
        private readonly userRepository: IUserRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(userId: string): Promise<UserResponseDTO> {
        this.logger.info('Fetching user by ID', { userId });

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User', userId);
        }

        return UserMapper.toResponseDTO(user);
    }
}