const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@gohaul.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 12)
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@gohaul.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        verified: true
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log(`Email: admin@gohaul.com`)
    console.log(`Password: AdminPassword123!`)
    console.log(`Role: ${admin.role}`)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 