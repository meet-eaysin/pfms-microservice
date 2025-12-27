import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../../../core/domain/repositories/category.repository';
import { Category } from '../../../core/domain/models/category.model';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.parentId,
      prismaCategory.icon,
      prismaCategory.createdAt,
      prismaCategory.updatedAt
    );
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        parentId: category.parentId,
        icon: category.icon,
      },
    });
    return this.toDomain(created);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany();
    return categories.map((c) => this.toDomain(c));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? this.toDomain(category) : null;
  }
}
