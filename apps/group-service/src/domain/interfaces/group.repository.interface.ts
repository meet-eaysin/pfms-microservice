import {
  FinanceGroup,
  GroupMember,
  GroupExpense,
  ExpenseSplit,
  Settlement,
} from '../entities/group.entity';

export interface IGroupRepository {
  // Group
  createGroup(group: FinanceGroup): Promise<FinanceGroup>;
  findGroupById(id: string): Promise<FinanceGroup | null>;
  findGroupsByUserId(userId: string): Promise<FinanceGroup[]>;
  updateGroup(group: FinanceGroup): Promise<FinanceGroup>;

  // Member
  addMember(member: GroupMember): Promise<GroupMember>;
  findMembersByGroupId(groupId: string): Promise<GroupMember[]>;
  findMember(groupId: string, userId: string): Promise<GroupMember | null>;
  updateMember(member: GroupMember): Promise<GroupMember>;

  // Expense
  createExpense(expense: GroupExpense, splits: ExpenseSplit[]): Promise<GroupExpense>;
  findExpenseById(id: string): Promise<GroupExpense | null>;
  findExpensesByGroupId(groupId: string): Promise<GroupExpense[]>;
  findSplitsByExpenseId(expenseId: string): Promise<ExpenseSplit[]>;

  // Settlement
  createSettlement(settlement: Settlement): Promise<Settlement>;
  findSettlementsByGroupId(groupId: string): Promise<Settlement[]>;
  updateSettlement(settlement: Settlement): Promise<Settlement>;
}
