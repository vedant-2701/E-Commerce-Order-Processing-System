import { describe, jest, it, expect, beforeEach } from '@jest/globals';
import { CreateUserUseCase } from '../../../../../src/application/use-cases/user/CreateUserUseCase.js';
import { IUserRepository } from '../../../../../src/application/interfaces/repositories/IUserRepository.js';
import { MockLogger } from '../../../../helpers/mocks/MockLogger';
import { UserBuilder } from '../../../../helpers/builders/UserBuilder.js';
import { ValidationError } from '../../../../../src/shared/errors/ValidationError.js';

describe('CreateUserUseCase', () => {
    let createUserUseCase: CreateUserUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockLogger: ReturnType<typeof MockLogger.create>;

    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        mockLogger = MockLogger.create();

        createUserUseCase = new CreateUserUseCase(
            mockUserRepository,
            mockLogger
        );
    });

    describe('execute', () => {
        it('should create a new user successfully', async () => {
            const createUserDto = {
                email: 'test@example.com',
                password: 'password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '9876543210'
            };

            const createdUser = new UserBuilder()
                .withId('user-123')
                .withEmail('test@example.com')
                .withName('John', 'Doe')
                .build();

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(createdUser);

            const result = await createUserUseCase.execute(createUserDto);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(mockUserRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '9876543210',
                    id: expect.any(String),
                    password: expect.any(String),
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                })
            );

            expect(result).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phone: createdUser.phone,
                createdAt: createdUser.createdAt,
            });

            expect(mockLogger.info).toHaveBeenCalledWith(
                'User created successfully',
                { userId: createdUser.id, email: createdUser.email }
            );
        });

        it('should throw ValidationError if email already exists', async () => {
            const createUserDto = {
                email: 'existing@example.com',
                password: 'password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '9876543210'
            };

            mockUserRepository.findByEmail.mockResolvedValue(new UserBuilder().build());

            await expect(createUserUseCase.execute(createUserDto)).rejects.toThrow(ValidationError);
        });
    });
});