import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetUserByIdUseCase } from '../../../../../src/application/use-cases/user/GetUserByIdUseCase.js';
import { IUserRepository } from '../../../../../src/application/interfaces/repositories/IUserRepository.js';
import { NotFoundError } from '../../../../../src/shared/errors/NotFoundError.js';
import { UserBuilder } from '../../../../helpers/builders/UserBuilder.js';
import { MockLogger } from '../../../../helpers/mocks/MockLogger.js';

describe('GetUserByIdUseCase', () => {
    let getUserByIdUseCase: GetUserByIdUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockLogger: ReturnType<typeof MockLogger.create>;

    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        mockLogger = MockLogger.create();

        getUserByIdUseCase = new GetUserByIdUseCase(
            mockUserRepository,
            mockLogger
        );
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            
            const user = new UserBuilder()
                .withId('user-123')
                .withEmail('test@example.com')
                .withName('John', 'Doe')
                .build();

            mockUserRepository.findById.mockResolvedValue(user);

            
            const result = await getUserByIdUseCase.execute('user-123');

            
            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phone: user.phone,
                createdAt: user.createdAt,
            });
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Fetching user by ID',
                { userId: 'user-123' }
            );
        });

        it('should throw NotFoundError when user does not exist', async () => {
            
            mockUserRepository.findById.mockResolvedValue(null);

            
            await expect(
                getUserByIdUseCase.execute('non-existent-id')
            ).rejects.toThrow(NotFoundError);

            expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
        });
    });
});