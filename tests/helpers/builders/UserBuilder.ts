import { faker } from '@faker-js/faker';
import { User } from '../../../src/domain/entities/User.js';

export class UserBuilder {
    private user: User;

    constructor() {
        this.user = {
            id: faker.string.uuid(),
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            password: faker.string.alphanumeric(60),
            phone: faker.phone.number(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    }

    withId(id: string): this {
        this.user.id = id;
        return this;
    }

    withEmail(email: string): this {
        this.user.email = email;
        return this;
    }

    withName(firstName: string, lastName: string): this {
        this.user.firstName = firstName;
        this.user.lastName = lastName;
        return this;
    }

    build(): User {
        return { ...this.user };
    }
}