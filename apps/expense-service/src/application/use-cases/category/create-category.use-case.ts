import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ICategoryRepository } from '../../../domain/interfaces/category.repository';
import { Category } from '../../../domain/entities/category.model';

export interface CreateCategoryCommand {
  name: string;
  parentId?: string;
  icon?: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    if (command.parentId) {
      const parent = await this.categoryRepository.findById(command.parentId);
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.categoryRepository.create({
      name: command.name,
      parentId: command.parentId || null,
      icon: command.icon || null,
    });
  }
}
