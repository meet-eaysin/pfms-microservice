import { Module } from '@nestjs/common';
import { CategoryController } from '../presentation/controllers/category.controller';
import { CreateCategoryUseCase } from '../application/use-cases/category/create-category.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/category/get-categories.use-case';

@Module({
  controllers: [CategoryController],
  providers: [CreateCategoryUseCase, GetCategoriesUseCase],
})
export class CategoryModule {}
