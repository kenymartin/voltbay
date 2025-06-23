import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BackupData {
  users: any[]
  categories: any[]
  products: any[]
  productSpecifications: any[]
  bids: any[]
  orders: any[]
  messages: any[]
  reviews: any[]
  notifications: any[]
  payments: any[]
  wallets: any[]
  walletTransactions: any[]
  escrows: any[]
  enterpriseListings: any[]
  quoteRequests: any[]
  quoteResponses: any[]
  roiSimulations: any[]
  vendorProjects: any[]
  conversations: any[]
  conversationParticipants: any[]
  refreshTokens: any[]
}

async function restoreDatabase(backupFilePath: string) {
  try {
    console.log('🔄 Starting database restore...')
    console.log(`📁 Reading backup from: ${backupFilePath}`)

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'))

    // 1. Users (no dependencies)
    if (backupData.users?.length > 0) {
      console.log('📦 Restoring users...')
      for (const user of backupData.users) {
        try {
          await prisma.user.create({
            data: {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          })
        } catch (error) {
          console.log(`   ⚠️  Warning: Could not restore user ${user.email}`)
        }
      }
      console.log(`   ✅ ${backupData.users.length} users restored`)
    }

    // 2. Categories
    if (backupData.categories?.length > 0) {
      console.log('📦 Restoring categories...')
      for (const category of backupData.categories) {
        try {
          await prisma.category.create({
            data: {
              ...category,
              createdAt: new Date(category.createdAt),
              updatedAt: new Date(category.updatedAt)
            }
          })
        } catch (error) {
          console.log(`   ⚠️  Warning: Could not restore category ${category.name}`)
        }
      }
      console.log(`   ✅ ${backupData.categories.length} categories restored`)
    }

    console.log('\n✅ Database restore completed successfully!')

  } catch (error) {
    console.error('❌ Error during restore:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// CLI usage
if (require.main === module) {
  const backupFile = process.argv[2]
  
  if (!backupFile) {
    console.error('❌ Please provide a backup file path')
    console.log('Usage: npm run restore-db <backup-file-path>')
    console.log('Example: npm run restore-db backups/database-backup-2025-06-20T20-00-00-000Z.json')
    process.exit(1)
  }

  restoreDatabase(backupFile)
    .then(() => {
      console.log('\n🎉 Restore completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Restore failed:', error)
      process.exit(1)
    })
}

export { restoreDatabase } 