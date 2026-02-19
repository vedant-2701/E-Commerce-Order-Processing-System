export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
        }],
    },
    resetMocks: true,
    moduleNameMapper: {
        '^@config/(.*)\\.js$': '<rootDir>/src/config/$1',
        '^@domain/(.*)\\.js$': '<rootDir>/src/domain/$1',
        '^@application/(.*)\\.js$': '<rootDir>/src/application/$1',
        '^@infrastructure/(.*)\\.js$': '<rootDir>/src/infrastructure/$1',
        '^@presentation/(.*)\\.js$': '<rootDir>/src/presentation/$1',
        '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1',
        '^generated/(.*)\\.js$': '<rootDir>/src/generated/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/generated/**',
        '!src/app.ts',
        '!src/test-di.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};