export class Habit {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly unitCost: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class HabitLog {
  constructor(
    public readonly id: string,
    public readonly habitId: string,
    public readonly quantity: number,
    public readonly date: Date,
    public readonly createdAt: Date
  ) {}
}
