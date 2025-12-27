import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../../core/application/use-cases/category/create-category.use-case';
import { GetCategoriesUseCase } from '../../../core/application/use-cases/category/get-categories.use-case';
import { CreateCategoryDto } from '../../../core/application/dto/category/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }

  @Get()
  async findAll() {
    return this.getCategoriesUseCase.execute();
  }
}
