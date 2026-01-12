import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { IGroupRepository } from '../domain/interfaces/group.repository.interface';
import { CreateGroupUseCase } from '../application/use-cases/create-group.use-case';
import { AddMemberUseCase } from '../application/use-cases/add-member.use-case';
import { AddExpenseUseCase } from '../application/use-cases/add-expense.use-case';
import { GetGroupsUseCase } from '../application/use-cases/get-groups.use-case';
import { GetGroupDetailsUseCase } from '../application/use-cases/get-group-details.use-case';
import { GroupController } from '@/presentation/controllers/group.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [GroupController],
  providers: [
    {
      provide: CreateGroupUseCase,
      useFactory: (repo: IGroupRepository) => new CreateGroupUseCase(repo),
      inject: ['IGroupRepository'],
    },
    {
      provide: AddMemberUseCase,
      useFactory: (repo: IGroupRepository) => new AddMemberUseCase(repo),
      inject: ['IGroupRepository'],
    },
    {
      provide: AddExpenseUseCase,
      useFactory: (repo: IGroupRepository) => new AddExpenseUseCase(repo),
      inject: ['IGroupRepository'],
    },
    {
      provide: GetGroupsUseCase,
      useFactory: (repo: IGroupRepository) => new GetGroupsUseCase(repo),
      inject: ['IGroupRepository'],
    },
    {
      provide: GetGroupDetailsUseCase,
      useFactory: (repo: IGroupRepository) => new GetGroupDetailsUseCase(repo),
      inject: ['IGroupRepository'],
    },
  ],
})
export class GroupModule {}
