import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateProductUseCase } from '../../../../../src/application/use-cases/product/CreateProductUseCase.js';
import { IProductRepository } from '../../../../../src/application/interfaces/repositories/IProductRepository.js';
import { IInventoryRepository } from '../../../../../src/application/interfaces/repositories/IInventoryRepository.js';
import { ValidationError } from '../../../../../src/shared/errors/ValidationError.js';
import { CreateProductDTO } from '../../../../../src/application/dto/ProductDTO.js';
import { ProductBuilder } from '../../../../helpers/builders/ProductBuilder.js';
import { MockLogger } from '../../../../helpers/mocks/MockLogger.js';

describe('CreateProductUseCase', () => {
    let createProductUseCase: CreateProductUseCase;
    let mockProductRepository: jest.Mocked<IProductRepository>;
    let mockInventoryRepository: jest.Mocked<IInventoryRepository>;
    let mockLogger: ReturnType<typeof MockLogger.create>;

    beforeEach(() => {
        mockProductRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findBySku: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        mockInventoryRepository = {
            findByProductId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getAvailableStock: jest.fn(),
            checkAvailability: jest.fn(),
        } as any;

        mockLogger = MockLogger.create();

        createProductUseCase = new CreateProductUseCase(
            mockProductRepository,
            mockInventoryRepository,
            mockLogger
        );
    });

    describe('execute', () => {
        it('should create product with inventory successfully', async () => {
            
            const dto: CreateProductDTO = {
                name: 'Test Product',
                description: 'Test Description',
                price: 5000,
                categoryId: 'category-123',
                sku: 'TEST-SKU-001',
                initialStock: 100,
            };

            const createdProduct = new ProductBuilder()
                .withName(dto.name)
                .withPrice(dto.price)
                .withSku(dto.sku)
                .build();

            mockProductRepository.findBySku.mockResolvedValue(null);
            mockProductRepository.create.mockResolvedValue(createdProduct);
            mockInventoryRepository.create.mockResolvedValue({
                id: 'inventory-1',
                productId: createdProduct.id,
                quantity: 100,
                minStockLevel: 10,
                updatedAt: new Date(),
            });

            const result = await createProductUseCase.execute(dto);

            expect(mockProductRepository.findBySku).toHaveBeenCalledWith('TEST-SKU-001');
            expect(mockProductRepository.create).toHaveBeenCalled();
            expect(mockInventoryRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    productId: createdProduct.id,
                    quantity: 100,
                    minStockLevel: 10,
                })
            );
            expect(result.name).toBe('Test Product');
            expect(result.sku).toBe('TEST-SKU-001');
        });

        it('should throw ValidationError if SKU already exists', async () => {
            
            const dto: CreateProductDTO = {
                name: 'Test Product',
                description: 'Test Description',
                price: 5000,
                categoryId: 'category-123',
                sku: 'EXISTING-SKU',
                initialStock: 100,
            };

            const existingProduct = new ProductBuilder()
                .withSku('EXISTING-SKU')
                .build();

            mockProductRepository.findBySku.mockResolvedValue(existingProduct);

            await expect(
                createProductUseCase.execute(dto)
            ).rejects.toThrow(ValidationError);

            expect(mockProductRepository.findBySku).toHaveBeenCalledWith('EXISTING-SKU');
            expect(mockProductRepository.create).not.toHaveBeenCalled();
        });
    });
});