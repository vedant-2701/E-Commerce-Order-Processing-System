import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserRepository } from '../../../../src/infrastructure/database/repositories/UserRepository.js';
import { DatabaseConnection } from '../../../../src/infrastructure/database/DatabaseConnection.js';
import { UserBuilder } from '../../../helpers/builders/UserBuilder.js';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let mockDatabaseConnection: jest.Mocked<DatabaseConnection>;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            user: {
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };

        mockDatabaseConnection = {
            getClient: jest.fn().mockReturnValue(mockPrisma),
        } as any;

        userRepository = new UserRepository(mockDatabaseConnection);
    });

    describe('findById', () => {
        it('should return user when found', async () => {
            
            const user = new UserBuilder().withId('user-123').build();

            mockPrisma.user.findUnique.mockResolvedValue(user);

            // Act
            const result = await userRepository.findById('user-123');

            // Assert
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-123' },
            });
            expect(result).toEqual(user);
        });

        it('should return null when user not found', async () => {
            
            mockPrisma.user.findUnique.mockResolvedValue(null);
            
            const result = await userRepository.findById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update user successfully', async () => {
            
            const user = new UserBuilder()
                .withId('user-123')
                .withName('John', 'Updated')
                .build();

            mockPrisma.user.update.mockResolvedValue(user);

            const result = await userRepository.update(user);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: {
                    firstName: 'John',
                    lastName: 'Updated',
                    phone: user.phone,
                },
            });
            expect(result.firstName).toBe('John');
            expect(result.lastName).toBe('Updated');
        });
    });
});