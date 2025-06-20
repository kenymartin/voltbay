import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUserRoles() {
  console.log('🔄 Starting user role migration...')

  try {
    // Update ADMIN users to SUPER_ADMIN
    const adminUpdate = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'SUPER_ADMIN' 
      WHERE role = 'ADMIN'
    `
    console.log(`✅ Updated ${adminUpdate} ADMIN users to SUPER_ADMIN`)

    // Update MODERATOR users to SUPER_ADMIN (they had elevated privileges)
    const moderatorUpdate = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'SUPER_ADMIN' 
      WHERE role = 'MODERATOR'
    `
    console.log(`✅ Updated ${moderatorUpdate} MODERATOR users to SUPER_ADMIN`)

    // Update ENTERPRISE_VENDOR users to USER (they can be upgraded to COMPANY_ADMIN later)
    const vendorUpdate = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'USER' 
      WHERE role = 'ENTERPRISE_VENDOR'
    `
    console.log(`✅ Updated ${vendorUpdate} ENTERPRISE_VENDOR users to USER`)

    console.log('🎉 User role migration completed successfully!')
    
    // Show current user role distribution
    const roleStats = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `
    console.log('📊 Current user role distribution:', roleStats)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUserRoles()
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

export default migrateUserRoles 