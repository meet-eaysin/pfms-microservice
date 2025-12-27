import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'test-user-id'; // Default test user ID

  console.log('🌱 Seeding default ledger accounts...');

  // Create default accounts
  const accounts = await prisma.account.createMany({
    data: [
      {
        id: 'default-cash-account',
        userId,
        name: 'Cash',
        type: 'ASSET',
        subtype: 'Current Asset',
        currency: 'USD',
        balance: 0,
        isMutable: true,
      },
      {
        id: 'default-bank-account',
        userId,
        name: 'Bank Account',
        type: 'ASSET',
        subtype: 'Current Asset',
        currency: 'USD',
        balance: 0,
        isMutable: true,
      },
      {
        id: 'default-expense-account',
        userId,
        name: 'General Expenses',
        type: 'EXPENSE',
        subtype: 'Operating Expense',
        currency: 'USD',
        balance: 0,
        isMutable: true,
      },
      {
        id: 'default-income-account',
        userId,
        name: 'General Income',
        type: 'REVENUE',
        subtype: 'Operating Revenue',
        currency: 'USD',
        balance: 0,
        isMutable: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${accounts.count} default accounts`);
  console.log('   - Cash (ASSET)');
  console.log('   - Bank Account (ASSET)');
  console.log('   - General Expenses (EXPENSE)');
  console.log('   - General Income (REVENUE)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
