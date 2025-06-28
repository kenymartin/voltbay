import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function approveEnterpriseUsers() {
  console.log('🚀 Approving all enterprise users...')
  
  try {
    // Update all enterprise users to be verified
    const result = await prisma.user.updateMany({
      where: {
        isEnterprise: true,
        verified: false
      },
      data: {
        verified: true
      }
    })
    
    console.log(`✅ Approved ${result.count} enterprise users`)
    
    // Get counts for verification
    const enterpriseVendors = await prisma.user.count({
      where: { role: 'VENDOR', isEnterprise: true, verified: true }
    })
    
    const enterpriseBuyers = await prisma.user.count({
      where: { role: 'BUYER', isEnterprise: true, verified: true }
    })
    
    console.log('\n📊 Enterprise Users Status:')
    console.log(`   ✅ Approved Enterprise Vendors: ${enterpriseVendors}`)
    console.log(`   ✅ Approved Enterprise Buyers: ${enterpriseBuyers}`)
    console.log('\n🔑 All enterprise users can now login with password: password123')
    console.log('\n📧 Key accounts ready for login:')
    console.log('   enterprise-vendor@example.com')
    console.log('   enterprise-buyer@example.com')
    
  } catch (error) {
    console.error('❌ Error approving enterprise users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

approveEnterpriseUsers()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 