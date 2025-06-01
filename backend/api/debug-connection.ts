import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function debug() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  console.log('Prisma client connecting...')
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log('Database info:', result)
    
    // Count products
    const count = await prisma.product.count()
    console.log('Product count via Prisma:', count)
    
    // Raw query to count products
    const rawCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM products`
    console.log('Product count via raw query:', rawCount)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debug() 