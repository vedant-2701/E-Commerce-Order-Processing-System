import { User } from '@domain/entities/User.js';
import { UserResponseDTO } from '../dto/UserDTO.js';

export class UserMapper {
    static toResponseDTO(user: User): UserResponseDTO {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            createdAt: user.createdAt,
        };
    }
}