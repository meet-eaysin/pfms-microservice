import { Inject, Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/interfaces/category.repository';
import { Category } from '../../../domain/entities/category.model';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
