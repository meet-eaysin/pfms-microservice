export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum SplitType {
  EQUAL = 'EQUAL',
  UNEQUAL = 'UNEQUAL',
  PERCENTAGE = 'PERCENTAGE',
  WEIGHT = 'WEIGHT',
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class FinanceGroup {
  constructor(
    public readonly id: string,
    public name: string,
    public createdBy: string,
    public description?: string,
    public groupType: string = 'general',
    public isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class GroupMember {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly userId: string,
    public role: MemberRole = MemberRole.MEMBER,
    public displayName?: string,
    public isActive: boolean = true,
    public readonly joinedAt?: Date
  ) {}
}

export class GroupExpense {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly paidBy: string,
    public amount: number,
    public currency: string,
    public description: string,
    public date: Date,
    public splitType: SplitType = SplitType.EQUAL,
    public category?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class ExpenseSplit {
  constructor(
    public readonly id: string,
    public readonly groupExpenseId: string,
    public readonly userId: string,
    public shareAmount: number,
    public sharePercentage?: number,
    public isPaid: boolean = false,
    public paidAt?: Date,
    public readonly createdAt?: Date
  ) {}
}

export class Settlement {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly fromUserId: string,
    public readonly toUserId: string,
    public amount: number,
    public currency: string,
    public status: SettlementStatus = SettlementStatus.PENDING,
    public settlementDate?: Date,
    public notes?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
