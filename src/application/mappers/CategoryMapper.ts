import { Category } from '@domain/entities/Category.js';
import { CategoryResponseDTO } from '../dto/CategoryDTO.js';

export class CategoryMapper {
    static toResponseDTO(category: Category, productCount: number): CategoryResponseDTO {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            productCount,
            createdAt: category.createdAt,
        };
    }
}
