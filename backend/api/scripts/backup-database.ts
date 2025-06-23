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

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...')

    const backup: BackupData = {
      users: [],
      categories: [],
      products: [],
      productSpecifications: [],
      bids: [],
      orders: [],
      messages: [],
      reviews: [],
      notifications: [],
      payments: [],
      wallets: [],
      walletTransactions: [],
      escrows: [],
      enterpriseListings: [],
      quoteRequests: [],
      quoteResponses: [],
      roiSimulations: [],
      vendorProjects: [],
      conversations: [],
      conversationParticipants: [],
      refreshTokens: []
    }

    // Backup Users
    console.log('📦 Backing up users...')
    backup.users = await prisma.user.findMany()
    console.log(`   ✅ ${backup.users.length} users backed up`)

    // Backup Categories
    console.log('📦 Backing up categories...')
    backup.categories = await prisma.category.findMany()
    console.log(`   ✅ ${backup.categories.length} categories backed up`)

    // Backup Products
    console.log('📦 Backing up products...')
    backup.products = await prisma.product.findMany()
    console.log(`   ✅ ${backup.products.length} products backed up`)

    // Backup Product Specifications
    console.log('📦 Backing up product specifications...')
    backup.productSpecifications = await prisma.productSpecification.findMany()
    console.log(`   ✅ ${backup.productSpecifications.length} product specifications backed up`)

    // Backup Bids
    console.log('📦 Backing up bids...')
    backup.bids = await prisma.bid.findMany()
    console.log(`   ✅ ${backup.bids.length} bids backed up`)

    // Backup Orders
    console.log('📦 Backing up orders...')
    backup.orders = await prisma.order.findMany()
    console.log(`   ✅ ${backup.orders.length} orders backed up`)

    // Backup Messages
    console.log('📦 Backing up messages...')
    backup.messages = await prisma.message.findMany()
    console.log(`   ✅ ${backup.messages.length} messages backed up`)

    // Backup Reviews
    console.log('📦 Backing up reviews...')
    backup.reviews = await prisma.review.findMany()
    console.log(`   ✅ ${backup.reviews.length} reviews backed up`)

    // Backup Notifications
    console.log('📦 Backing up notifications...')
    backup.notifications = await prisma.notification.findMany()
    console.log(`   ✅ ${backup.notifications.length} notifications backed up`)

    // Backup Payments
    console.log('📦 Backing up payments...')
    backup.payments = await prisma.payment.findMany()
    console.log(`   ✅ ${backup.payments.length} payments backed up`)

    // Backup Wallets
    console.log('📦 Backing up wallets...')
    backup.wallets = await prisma.wallet.findMany()
    console.log(`   ✅ ${backup.wallets.length} wallets backed up`)

    // Backup Wallet Transactions
    console.log('📦 Backing up wallet transactions...')
    backup.walletTransactions = await prisma.walletTransaction.findMany()
    console.log(`   ✅ ${backup.walletTransactions.length} wallet transactions backed up`)

    // Backup Escrows
    console.log('📦 Backing up escrows...')
    backup.escrows = await prisma.escrow.findMany()
    console.log(`   ✅ ${backup.escrows.length} escrows backed up`)

    // Backup Enterprise Listings
    console.log('📦 Backing up enterprise listings...')
    backup.enterpriseListings = await prisma.enterpriseListing.findMany()
    console.log(`   ✅ ${backup.enterpriseListings.length} enterprise listings backed up`)

    // Backup Quote Requests
    console.log('📦 Backing up quote requests...')
    backup.quoteRequests = await prisma.quoteRequest.findMany()
    console.log(`   ✅ ${backup.quoteRequests.length} quote requests backed up`)

    // Backup Quote Responses
    console.log('📦 Backing up quote responses...')
    backup.quoteResponses = await prisma.quoteResponse.findMany()
    console.log(`   ✅ ${backup.quoteResponses.length} quote responses backed up`)

    // Backup ROI Simulations
    console.log('📦 Backing up ROI simulations...')
    backup.roiSimulations = await prisma.rOISimulation.findMany()
    console.log(`   ✅ ${backup.roiSimulations.length} ROI simulations backed up`)

    // Backup Vendor Projects
    console.log('📦 Backing up vendor projects...')
    backup.vendorProjects = await prisma.vendorProject.findMany()
    console.log(`   ✅ ${backup.vendorProjects.length} vendor projects backed up`)

    // Backup Conversations (if exists)
    try {
      console.log('📦 Backing up conversations...')
      backup.conversations = await prisma.conversation.findMany()
      console.log(`   ✅ ${backup.conversations.length} conversations backed up`)
    } catch (error) {
      console.log('   ⚠️  Conversations table not found or accessible')
    }

    // Backup Conversation Participants (if exists)
    try {
      console.log('📦 Backing up conversation participants...')
      backup.conversationParticipants = await prisma.conversationParticipant.findMany()
      console.log(`   ✅ ${backup.conversationParticipants.length} conversation participants backed up`)
    } catch (error) {
      console.log('   ⚠️  Conversation participants table not found or accessible')
    }

    // Backup Refresh Tokens (optional - these can be regenerated)
    try {
      console.log('📦 Backing up refresh tokens...')
      backup.refreshTokens = await prisma.refreshToken.findMany()
      console.log(`   ✅ ${backup.refreshTokens.length} refresh tokens backed up`)
    } catch (error) {
      console.log('   ⚠️  Refresh tokens table not found or accessible')
    }

    // Create backup directory
    const backupDir = path.join(__dirname, '../backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Save backup to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(backupDir, `database-backup-${timestamp}.json`)
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    
    console.log('\n✅ Database backup completed successfully!')
    console.log(`📁 Backup saved to: ${backupFile}`)
    console.log('\n📊 Backup Summary:')
    console.log(`   • Users: ${backup.users.length}`)
    console.log(`   • Categories: ${backup.categories.length}`)
    console.log(`   • Products: ${backup.products.length}`)
    console.log(`   • Product Specifications: ${backup.productSpecifications.length}`)
    console.log(`   • Bids: ${backup.bids.length}`)
    console.log(`   • Orders: ${backup.orders.length}`)
    console.log(`   • Messages: ${backup.messages.length}`)
    console.log(`   • Reviews: ${backup.reviews.length}`)
    console.log(`   • Notifications: ${backup.notifications.length}`)
    console.log(`   • Payments: ${backup.payments.length}`)
    console.log(`   • Wallets: ${backup.wallets.length}`)
    console.log(`   • Wallet Transactions: ${backup.walletTransactions.length}`)
    console.log(`   • Escrows: ${backup.escrows.length}`)
    console.log(`   • Enterprise Listings: ${backup.enterpriseListings.length}`)
    console.log(`   • Quote Requests: ${backup.quoteRequests.length}`)
    console.log(`   • Quote Responses: ${backup.quoteResponses.length}`)
    console.log(`   • ROI Simulations: ${backup.roiSimulations.length}`)
    console.log(`   • Vendor Projects: ${backup.vendorProjects.length}`)
    console.log(`   • Conversations: ${backup.conversations.length}`)
    console.log(`   • Conversation Participants: ${backup.conversationParticipants.length}`)
    console.log(`   • Refresh Tokens: ${backup.refreshTokens.length}`)

    return backupFile

  } catch (error) {
    console.error('❌ Error during backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  backupDatabase()
    .then((backupFile) => {
      console.log(`\n🎉 Backup completed: ${backupFile}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Backup failed:', error)
      process.exit(1)
    })
}

export { backupDatabase } 