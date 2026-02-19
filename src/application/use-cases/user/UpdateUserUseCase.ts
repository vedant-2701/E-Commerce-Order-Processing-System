import { inject, singleton } from 'tsyringe';
import { DI_TOKENS } from '@config/di-tokens.js';
import type { IUserRepository } from '../../interfaces/repositories/IUserRepository.js';
import { UpdateUserDTO, UserResponseDTO } from '../../dto/UserDTO.js';
import { NotFoundError } from '@shared/errors/NotFoundError.js';
import { Logger } from '@infrastructure/logging/Logger.js';

@singleton()
export class UpdateUserUseCase {
    constructor(
        @inject(DI_TOKENS.IUserRepository)
        private readonly userRepository: IUserRepository,

        @inject(DI_TOKENS.Logger)
        private readonly logger: Logger
    ) {}

    async execute(userId: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
        this.logger.info('Updating user', { userId });

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User', userId);
        }

        // Only update provided fields
        const updatedUser = await this.userRepository.update({
            ...user,
            firstName: dto.firstName ?? user.firstName,
            lastName: dto.lastName ?? user.lastName,
            phone: dto.phone ?? user.phone,
            updatedAt: new Date(),
        });

        this.logger.info('User updated successfully', { userId });

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phone: updatedUser.phone,
            createdAt: updatedUser.createdAt,
        };
    }
}