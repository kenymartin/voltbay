import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWalletData() {
  console.log('🌱 Seeding wallet test data...');

  try {
    // Get or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: '$2b$10$K7L1OJ45/4Y2nIvM0RDOaOZfaFc9ZQnZ.k8YXl2lJZRNZP.VKS0.O', // password: test123
        }
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }

    // Create or get wallet for test user
    let wallet = await prisma.wallet.findUnique({
      where: { userId: testUser.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: testUser.id,
          balance: 1000.00, // Start with $1000
          lockedBalance: 0.00,
        }
      });
      console.log('✅ Created wallet with initial balance of $1000');
    } else {
      // Update existing wallet with test balance
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: 1000.00,
          lockedBalance: 0.00,
        }
      });
      console.log('✅ Updated existing wallet balance to $1000');
    }

    // Create some sample transactions
    const existingTransactions = await prisma.walletTransaction.count({
      where: { walletId: wallet.id }
    });

    if (existingTransactions === 0) {
      await prisma.walletTransaction.createMany({
        data: [
          {
            walletId: wallet.id,
            type: TransactionType.DEPOSIT,
            amount: 500.00,
            status: TransactionStatus.COMPLETED,
            description: 'Initial deposit',
            reference: 'INIT_001',
          },
          {
            walletId: wallet.id,
            type: TransactionType.DEPOSIT,
            amount: 500.00,
            status: TransactionStatus.COMPLETED,
            description: 'Second deposit',
            reference: 'INIT_002',
          },
          {
            walletId: wallet.id,
            type: TransactionType.PURCHASE,
            amount: -50.00,
            status: TransactionStatus.COMPLETED,
            description: 'Test purchase',
            reference: 'PURCHASE_001',
          },
        ]
      });
      console.log('✅ Created sample wallet transactions');
    } else {
      console.log('✅ Wallet transactions already exist');
    }

    // Create another test user for testing transfers
    let testUser2 = await prisma.user.findFirst({
      where: { email: 'test2@example.com' }
    });

    if (!testUser2) {
      testUser2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          firstName: 'Test',
          lastName: 'User 2',
          password: '$2b$10$K7L1OJ45/4Y2nIvM0RDOaOZfaFc9ZQnZ.k8YXl2lJZRNZP.VKS0.O', // password: test123
        }
      });

      // Create wallet for second user
      await prisma.wallet.create({
        data: {
          userId: testUser2.id,
          balance: 250.00,
          lockedBalance: 0.00,
        }
      });
      console.log('✅ Created second test user with wallet');
    } else {
      console.log('✅ Second test user already exists');
    }

    console.log('🎉 Wallet seeding completed successfully!');
    console.log(`Test User 1: ${testUser.email} (Password: test123)`);
    console.log(`Test User 2: ${testUser2.email} (Password: test123)`);

  } catch (error) {
    console.error('❌ Error seeding wallet data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedWalletData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedWalletData; 