import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: { children: true },
    });

    // Return only top-level categories with their children nested
    // (This is a simplified tree construction, assuming 1 level deep for now or handled recursively by client,
    // but the query fetches everything. Ideally we fetch root nodes and include children recursively or reconstruct tree in JS)
    // For simplicity in this step, returning flat list or simple hierarchy:

    // Better strategy: Fetch everything and build tree?
    // Or just fetch roots.
    return categories.filter((c) => !c.parentId);
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
