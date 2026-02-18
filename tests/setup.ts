import 'reflect-metadata';
import { jest } from '@jest/globals';

jest.setTimeout(10000);

global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};