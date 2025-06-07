const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...')
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@demo.com' }
    })
    
    if (existingUser) {
      console.log('✅ Test user already exists!')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Password123', 12)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@demo.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        verified: true
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log(`Email: test@demo.com`)
    console.log(`Password: Password123`)
    console.log(`Role: ${user.role}`)
    
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 