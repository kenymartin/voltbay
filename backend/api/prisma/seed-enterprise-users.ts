import { PrismaClient, UserRole, EnterpriseListingStatus, ProjectType, MountingType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🏭 Seeding Enterprise Users and Data...')

  // Hash password for all test accounts
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Get a category for enterprise listings
  const category = await prisma.category.findFirst({
    where: { name: 'Solar Panels' }
  })
  
  if (!category) {
    throw new Error('Solar Panels category not found. Please run the main seed first.')
  }

  // 1. Create Enterprise Vendor Companies
  console.log('👥 Creating Enterprise Vendor Users...')
  
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor@terramont.com' },
    update: {},
    create: {
      email: 'vendor@terramont.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Chen',
      role: UserRole.ENTERPRISE_VENDOR,
      verified: true,
      isEnterpriseVendor: true,
      companyName: 'TerraMount Solar Systems',
      locationCity: 'Austin',
      locationState: 'TX',
      phone: '+1-512-555-0101',
      street: '1234 Solar Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    }
  })

  const vendor2 = await prisma.user.upsert({
    where: { email: 'sales@sunpowerind.com' },
    update: {},
    create: {
      email: 'sales@sunpowerind.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: UserRole.ENTERPRISE_VENDOR,
      verified: true,
      isEnterpriseVendor: true,
      companyName: 'SunPower Industrial Solutions',
      locationCity: 'Phoenix',
      locationState: 'AZ',
      phone: '+1-602-555-0102',
      street: '5678 Energy Blvd',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    }
  })

  const vendor3 = await prisma.user.upsert({
    where: { email: 'contact@greenenergy.com' },
    update: {},
    create: {
      email: 'contact@greenenergy.com',
      password: hashedPassword,
      firstName: 'James',
      lastName: 'Wilson',
      role: UserRole.ENTERPRISE_VENDOR,
      verified: true,
      isEnterpriseVendor: true,
      companyName: 'Green Energy Solutions LLC',
      locationCity: 'Denver',
      locationState: 'CO',
      phone: '+1-303-555-0103',
      street: '9012 Renewable Ave',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA'
    }
  })

  // 2. Create Enterprise Customer Companies
  console.log('🏢 Creating Enterprise Customer Users...')
  
  const customer1 = await prisma.user.upsert({
    where: { email: 'procurement@manufactureplus.com' },
    update: {},
    create: {
      email: 'procurement@manufactureplus.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Thompson',
      role: UserRole.USER,
      verified: true,
      companyName: 'ManufacturePlus Industries',
      locationCity: 'Detroit',
      locationState: 'MI',
      phone: '+1-313-555-0201',
      street: '3456 Industrial Pkwy',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'USA'
    }
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'facilities@techcorp.com' },
    update: {},
    create: {
      email: 'facilities@techcorp.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Johnson',
      role: UserRole.USER,
      verified: true,
      companyName: 'TechCorp Enterprises',
      locationCity: 'San Jose',
      locationState: 'CA',
      phone: '+1-408-555-0202',
      street: '7890 Tech Center Dr',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      country: 'USA'
    }
  })

  const customer3 = await prisma.user.upsert({
    where: { email: 'energy@logisticshub.com' },
    update: {},
    create: {
      email: 'energy@logisticshub.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Martinez',
      role: UserRole.USER,
      verified: true,
      companyName: 'LogisticsHub Distribution',
      locationCity: 'Memphis',
      locationState: 'TN',
      phone: '+1-901-555-0203',
      street: '2468 Logistics Blvd',
      city: 'Memphis',
      state: 'TN',
      zipCode: '38103',
      country: 'USA'
    }
  })

  // 3. Create Enterprise Listings from Vendors
  console.log('📋 Creating Enterprise Listings...')

  const listing1 = await prisma.enterpriseListing.create({
    data: {
      name: 'Industrial Rooftop Solar Installation - 500kW+',
      description: 'Complete industrial rooftop solar installation service for manufacturing facilities. Includes design, permitting, installation, and commissioning. Specialized in large-scale commercial projects with proven track record.',
      categoryId: category.id,
      vendorId: vendor1.id,
      location: 'Austin, TX',
      deliveryTime: '6-9 months',
      basePrice: 1850,
      priceUnit: 'per kW',
      status: EnterpriseListingStatus.ACTIVE,
      quoteOnly: true,
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND'],
        serviceArea: ['TX', 'OK', 'NM', 'LA'],
        minimumProjectSize: 500,
        maximumProjectSize: 5000,
        features: [
          'Complete turnkey installation',
          'Engineering and design services',
          'Permitting and utility interconnection',
          '25-year performance warranty',
          'O&M services available',
          'NABCEP certified installers'
        ],
        certifications: ['NABCEP', 'OSHA 30', 'UL Listed Equipment'],
        yearsOfExperience: 12
      },
      imageUrls: [],
      documentUrls: []
    }
  })

  const listing2 = await prisma.enterpriseListing.create({
    data: {
      name: 'Commercial Solar Panel Supply - Tier 1 Modules',
      description: 'Premium Tier 1 solar panels for commercial and industrial applications. High-efficiency monocrystalline modules with 25-year warranty. Bulk pricing available for projects 1MW+.',
      categoryId: category.id,
      vendorId: vendor2.id,
      location: 'Phoenix, AZ',
      deliveryTime: '2-4 weeks',
      basePrice: 650,
      priceUnit: 'per kW',
      status: EnterpriseListingStatus.ACTIVE,
      quoteOnly: true,
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND', 'COMMERCIAL'],
        serviceArea: ['AZ', 'CA', 'NV', 'UT'],
        minimumProjectSize: 100,
        maximumProjectSize: 10000,
        features: [
          'Tier 1 solar panels',
          'High efficiency (21%+)',
          'Extended warranty options',
          'Bulk quantity discounts',
          'Technical support included',
          'Fast delivery nationwide'
        ],
        certifications: ['IEC 61215', 'IEC 61730', 'UL 1703'],
        yearsOfExperience: 8
      },
      imageUrls: [],
      documentUrls: []
    }
  })

  const listing3 = await prisma.enterpriseListing.create({
    data: {
      name: 'Solar Racking & Mounting Systems - Commercial Grade',
      description: 'Heavy-duty racking and mounting systems for commercial solar installations. Engineered for high wind and snow loads. Compatible with all major panel manufacturers.',
      categoryId: category.id,
      vendorId: vendor3.id,
      location: 'Denver, CO',
      deliveryTime: '3-5 weeks',
      basePrice: 450,
      priceUnit: 'per kW',
      status: EnterpriseListingStatus.ACTIVE,
      quoteOnly: true,
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND'],
        serviceArea: ['CO', 'WY', 'MT', 'ND', 'SD'],
        minimumProjectSize: 50,
        maximumProjectSize: 2000,
        features: [
          'High wind/snow load ratings',
          'Pre-assembled components',
          'Structural engineering included',
          'Corrosion-resistant materials',
          'Installation training provided',
          'Competitive bulk pricing'
        ],
        certifications: ['UL 2703', 'Structural Engineering Certification'],
        yearsOfExperience: 15
      },
      imageUrls: [],
      documentUrls: []
    }
  })

  // 4. Create Sample Quote Requests from Customers
  console.log('💬 Creating Sample Quote Requests...')

  const quoteRequest1 = await prisma.quoteRequest.create({
    data: {
      buyerCompanyId: customer1.id,
      listingId: listing1.id,
      requestedQuantity: 1200,
      projectSpecs: {
        description: 'Looking for complete solar installation for our 150,000 sq ft manufacturing facility. Need to offset 80% of our energy usage. Project timeline is 6-9 months.',
        requirements: [
          'Must meet local building codes',
          'Require performance monitoring system',
          'Need O&M contract for 10 years',
          'Financing options preferred'
        ]
      },
      deliveryDeadline: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 8 months from now
      notes: 'This is a high-priority project for our company. We need detailed proposals with financing options.',
      projectType: ProjectType.ROOFTOP,
      systemSizeKw: 1200,
      location: 'Detroit, MI',
      mountingType: MountingType.FIXED,
      budget: 2500000,
      status: 'PENDING'
    }
  })

  const quoteRequest2 = await prisma.quoteRequest.create({
    data: {
      buyerCompanyId: customer2.id,
      listingId: listing2.id,
      requestedQuantity: 800,
      projectSpecs: {
        description: 'Solar carport installation for employee parking. Looking for high-efficiency panels with tracking system to maximize energy production.',
        requirements: [
          'Carport structure included',
          'EV charging integration',
          'Aesthetic design important',
          'Minimal disruption during installation'
        ]
      },
      deliveryDeadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      notes: 'We want this to be a showcase project for our sustainability initiatives.',
      projectType: ProjectType.COMMERCIAL,
      systemSizeKw: 800,
      location: 'San Jose, CA',
      mountingType: MountingType.TRACKER,
      budget: 1800000,
      status: 'PENDING'
    }
  })

  // 5. Create Sample ROI Simulations
  console.log('📊 Creating Sample ROI Simulations...')

  const roiSim1 = await prisma.rOISimulation.create({
    data: {
      userId: customer1.id,
      projectType: ProjectType.ROOFTOP,
      location: 'Detroit, MI',
      systemSizeKw: 1200,
      panelWattage: 450,
      mountingType: MountingType.FIXED,
      targetBudget: 2500000,
      estimatedPanels: 2667,
      estimatedCost: 2220000,
      roiYears: 13.2,
      co2OffsetTons: 1176,
      installationTime: '6-9 months',
      freightCost: 45000,
      energyProduction: 1680000
    }
  })

  const roiSim2 = await prisma.rOISimulation.create({
    data: {
      userId: customer2.id,
      projectType: ProjectType.COMMERCIAL,
      location: 'San Jose, CA',
      systemSizeKw: 800,
      panelWattage: 400,
      mountingType: MountingType.TRACKER,
      targetBudget: 1800000,
      estimatedPanels: 2000,
      estimatedCost: 1760000,
      roiYears: 6.1,
      co2OffsetTons: 1008,
      installationTime: '4-6 months',
      freightCost: 28000,
      energyProduction: 1440000
    }
  })

  console.log('✅ Enterprise seed data created successfully!')
  console.log('\n📋 ENTERPRISE TEST ACCOUNTS:')
  console.log('\n🏭 VENDORS (Can create listings and respond to quotes):')
  console.log('   • vendor@terramont.com / password123 (David Chen - TerraMount Solar Systems)')
  console.log('   • sales@sunpowerind.com / password123 (Maria Rodriguez - SunPower Industrial)')
  console.log('   • contact@greenenergy.com / password123 (James Wilson - Green Energy Solutions)')
  
  console.log('\n🏢 CUSTOMERS (Can request quotes and use ROI simulator):')
  console.log('   • procurement@manufactureplus.com / password123 (Sarah Thompson - ManufacturePlus)')
  console.log('   • facilities@techcorp.com / password123 (Michael Johnson - TechCorp Enterprises)')
  console.log('   • energy@logisticshub.com / password123 (Lisa Martinez - LogisticsHub Distribution)')

  console.log('\n📊 CREATED DATA:')
  console.log(`   • ${3} Enterprise Listings`)
  console.log(`   • ${2} Quote Requests`)
  console.log(`   • ${2} ROI Simulations`)
  
  console.log('\n🔧 TESTING INSTRUCTIONS:')
  console.log('1. VENDORS can log in and view/respond to quote requests')
  console.log('2. CUSTOMERS can log in and use the ROI simulator')
  console.log('3. CUSTOMERS can browse enterprise listings and request quotes')
  console.log('4. Both can use the messaging system for communication')
  console.log('5. Document upload functionality is ready for testing')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding enterprise data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 