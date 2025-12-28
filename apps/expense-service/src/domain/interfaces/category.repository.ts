import { Category } from '../entities/category.model';

export interface ICategoryRepository {
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
}
