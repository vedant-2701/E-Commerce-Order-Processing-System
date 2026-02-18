import { Logger } from '../../../src/infrastructure/logging/Logger.js';
import { jest } from '@jest/globals';

export class MockLogger {
    static create(): jest.Mocked<Logger> {
        return {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as any;
    }
}