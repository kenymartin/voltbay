import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createEnterpriseUsers() {
  console.log('🚀 Creating enterprise users...')
  
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  // Create 40 Enterprise Vendors
  console.log('📝 Creating 40 Enterprise Vendors...')
  
  // First, create the specific enterprise-vendor@example.com
  const enterpriseVendorEmails = ['enterprise-vendor@example.com']
  
  // Generate 39 more enterprise vendor emails
  for (let i = 1; i <= 39; i++) {
    enterpriseVendorEmails.push(`enterprise-vendor-${i}@voltbay.com`)
  }
  
  const enterpriseVendors = enterpriseVendorEmails.map((email, index) => ({
    email,
    password: hashedPassword,
    firstName: `Enterprise Vendor ${index === 0 ? 'Main' : index}`,
    lastName: index === 0 ? 'User' : `User ${index}`,
    role: 'VENDOR' as const,
    isEnterprise: true,
    isEmailVerified: true,
    companyName: `Enterprise Solar Solutions ${index === 0 ? 'LLC' : `#${index}`}`,
    about: `Leading enterprise solar solutions provider specializing in large-scale commercial and industrial solar installations. ${index === 0 ? 'Primary enterprise vendor account.' : `Branch office ${index}.`}`,
    specialties: [
      'Commercial Solar Installations',
      'Industrial Solar Systems',
      'Energy Storage Solutions',
      'Grid-Tie Systems',
      'Solar Maintenance'
    ],
    certifications: [
      'NABCEP PV Installation Professional',
      'OSHA 30-Hour Construction',
      'Electrical Contractor License',
      'Solar Energy International Certified'
    ],
    businessLicense: `BL-${String(index + 1000).padStart(6, '0')}`,
    locationCity: index === 0 ? 'San Francisco' : `City${index}`,
    locationState: index === 0 ? 'CA' : 'CA',
    phone: `+1-555-${String(index + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    website: `https://enterprise-solar-${index === 0 ? 'main' : index}.com`
  }))
  
  // Create 30 Enterprise Buyers
  console.log('📝 Creating 30 Enterprise Buyers...')
  
  // First, create the specific enterprise-buyer@example.com
  const enterpriseBuyerEmails = ['enterprise-buyer@example.com']
  
  // Generate 29 more enterprise buyer emails
  for (let i = 1; i <= 29; i++) {
    enterpriseBuyerEmails.push(`enterprise-buyer-${i}@voltbay.com`)
  }
  
  const enterpriseBuyers = enterpriseBuyerEmails.map((email, index) => ({
    email,
    password: hashedPassword,
    firstName: `Enterprise Buyer ${index === 0 ? 'Main' : index}`,
    lastName: index === 0 ? 'User' : `User ${index}`,
    role: 'BUYER' as const,
    isEnterprise: true,
    isEmailVerified: true,
    companyName: `Enterprise Corp ${index === 0 ? 'International' : `#${index}`}`,
    about: `Large enterprise organization seeking comprehensive solar energy solutions for our facilities. ${index === 0 ? 'Primary enterprise buyer account.' : `Division ${index}.`}`,
    locationCity: index === 0 ? 'New York' : `City${index + 100}`,
    locationState: index === 0 ? 'NY' : 'NY',
    phone: `+1-555-${String(index + 200).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    website: `https://enterprise-corp-${index === 0 ? 'main' : index}.com`
  }))
  
  try {
    // Insert enterprise vendors
    console.log('💾 Inserting enterprise vendors...')
    for (const vendor of enterpriseVendors) {
      try {
        await prisma.user.create({ data: vendor })
        console.log(`✅ Created enterprise vendor: ${vendor.email}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Enterprise vendor already exists: ${vendor.email}`)
        } else {
          console.error(`❌ Error creating vendor ${vendor.email}:`, error.message)
        }
      }
    }
    
    // Insert enterprise buyers
    console.log('💾 Inserting enterprise buyers...')
    for (const buyer of enterpriseBuyers) {
      try {
        await prisma.user.create({ data: buyer })
        console.log(`✅ Created enterprise buyer: ${buyer.email}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Enterprise buyer already exists: ${buyer.email}`)
        } else {
          console.error(`❌ Error creating buyer ${buyer.email}:`, error.message)
        }
      }
    }
    
    // Summary
    const totalVendors = await prisma.user.count({
      where: { role: 'VENDOR', isEnterprise: true }
    })
    
    const totalBuyers = await prisma.user.count({
      where: { role: 'BUYER', isEnterprise: true }
    })
    
    console.log('\n🎉 Enterprise user creation completed!')
    console.log(`📊 Total Enterprise Vendors: ${totalVendors}`)
    console.log(`📊 Total Enterprise Buyers: ${totalBuyers}`)
    console.log('\n🔑 Login credentials for all users:')
    console.log('   Password: password123')
    console.log('\n📧 Key accounts created:')
    console.log('   enterprise-vendor@example.com (Enterprise Vendor)')
    console.log('   enterprise-buyer@example.com (Enterprise Buyer)')
    
  } catch (error) {
    console.error('❌ Error creating enterprise users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createEnterpriseUsers()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }) 