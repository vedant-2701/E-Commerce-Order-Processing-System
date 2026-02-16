export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
};