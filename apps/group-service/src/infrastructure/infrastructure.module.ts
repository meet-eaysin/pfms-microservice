import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma.service';
import { PrismaGroupRepository } from './persistence/repositories/group.repository.impl';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'IGroupRepository',
      useClass: PrismaGroupRepository,
    },
  ],
  exports: [PrismaService, 'IGroupRepository'],
})
export class InfrastructureModule {}
