export interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface UserResponseDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: Date;
}

export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    phone?: string;
}