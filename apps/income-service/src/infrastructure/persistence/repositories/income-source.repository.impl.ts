import { Injectable } from '@nestjs/common';
import { IIncomeSourceRepository } from '@/domain/interfaces/income-source.repository';
import { IncomeSource } from '@/domain/entities/income-source.model';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaIncomeSourceRepository implements IIncomeSourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaSource: any): IncomeSource {
    return new IncomeSource(
      prismaSource.id,
      prismaSource.userId,
      prismaSource.name,
      prismaSource.type,
      prismaSource.currency,
      prismaSource.paySchedule,
      prismaSource.createdAt,
      prismaSource.updatedAt
    );
  }

  async create(
    source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IncomeSource> {
    const created = await this.prisma.incomeSource.create({
      data: {
        userId: source.userId,
        name: source.name,
        type: source.type,
        currency: source.currency,
        paySchedule: source.paySchedule as any,
      },
    });
    return this.toDomain(created);
  }

  async findAll(userId: string): Promise<IncomeSource[]> {
    const sources = await this.prisma.incomeSource.findMany({ where: { userId } });
    return sources.map((s) => this.toDomain(s));
  }

  async findById(id: string): Promise<IncomeSource | null> {
    const source = await this.prisma.incomeSource.findUnique({ where: { id } });
    return source ? this.toDomain(source) : null;
  }

  async update(
    id: string,
    data: Partial<Omit<IncomeSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<IncomeSource> {
    const updated = await this.prisma.incomeSource.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.paySchedule !== undefined && { paySchedule: data.paySchedule as any }),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.incomeSource.delete({ where: { id } });
  }
}
