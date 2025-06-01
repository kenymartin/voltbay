import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuration
const ADMIN_EMAIL = 'admin@voltbay.io'
const ADMIN_PASSWORD = 'Password123'
const TEST_USER_EMAIL = 'testuser@voltbay.com'

async function main() {
  console.log('🌱 Starting Migration-Safe Fake Data Seeding...')
  console.log('==============================================')
  
  try {
    // Step 1: Clean existing data (optional - commented out for safety)
    // await cleanExistingData()
    
    // Step 2: Create or verify users
    const users = await createUsers()
    
    // Step 3: Create categories
    const categories = await createCategories()
    
    // Step 4: Create products with specifications
    const products = await createProducts(users, categories)
    
    // Step 5: Create sample bids for auctions
    await createSampleBids(users, products)
    
    // Step 6: Verify data integrity
    await verifyDataIntegrity()
    
    console.log('\n✅ Migration-Safe Fake Data Seeding Complete!')
    console.log('==============================================')
    console.log('📊 Summary:')
    console.log(`   Users: ${users.length}`)
    console.log(`   Categories: ${Object.keys(categories).length}`)
    console.log(`   Products: ${products.length}`)
    console.log('')
    console.log('🔑 Test Accounts:')
    console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    console.log(`   User:  ${TEST_USER_EMAIL} / ${ADMIN_PASSWORD}`)
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

async function cleanExistingData() {
  console.log('🧹 Cleaning existing data...')
  
  // Delete in reverse dependency order
  await prisma.bid.deleteMany()
  await prisma.productSpecification.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Existing data cleaned')
}

async function createUsers() {
  console.log('👥 Creating users...')
  
  const usersData = [
    {
      email: ADMIN_EMAIL,
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // Password123
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true
    },
    {
      email: TEST_USER_EMAIL,
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // Password123
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      verified: true
    },
    {
      email: 'seller1@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // Password123
      firstName: 'John',
      lastName: 'Seller',
      role: 'USER',
      verified: true
    },
    {
      email: 'seller2@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // Password123
      firstName: 'Sarah',
      lastName: 'Green',
      role: 'USER',
      verified: true
    }
  ]
  
  const users = []
  
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        verified: userData.verified,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      create: userData
    })
    users.push(user)
    console.log(`✅ User: ${user.email} (${user.role})`)
  }
  
  return users
}

async function createCategories() {
  console.log('📁 Creating categories...')
  
  // Main categories
  const solarPanels = await prisma.category.upsert({
    where: { name: 'Solar Panels' },
    update: {},
    create: {
      name: 'Solar Panels',
      description: 'Photovoltaic panels for converting sunlight to electricity',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'
    }
  })

  const batteries = await prisma.category.upsert({
    where: { name: 'Batteries' },
    update: {},
    create: {
      name: 'Batteries',
      description: 'Energy storage solutions for solar systems',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    }
  })

  const inverters = await prisma.category.upsert({
    where: { name: 'Inverters' },
    update: {},
    create: {
      name: 'Inverters',
      description: 'Convert DC power from solar panels to AC power',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
    }
  })

  const chargeControllers = await prisma.category.upsert({
    where: { name: 'Charge Controllers' },
    update: {},
    create: {
      name: 'Charge Controllers',
      description: 'Regulate power flow from solar panels to batteries',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
    }
  })

  const mountingSystems = await prisma.category.upsert({
    where: { name: 'Mounting Systems' },
    update: {},
    create: {
      name: 'Mounting Systems',
      description: 'Hardware for mounting solar panels',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
    }
  })

  // Subcategories
  const monocrystalline = await prisma.category.upsert({
    where: { name: 'Monocrystalline Panels' },
    update: {},
    create: {
      name: 'Monocrystalline Panels',
      description: 'High-efficiency single crystal solar panels',
      parentId: solarPanels.id
    }
  })

  const polycrystalline = await prisma.category.upsert({
    where: { name: 'Polycrystalline Panels' },
    update: {},
    create: {
      name: 'Polycrystalline Panels',
      description: 'Cost-effective multi-crystal solar panels',
      parentId: solarPanels.id
    }
  })

  const lithiumBatteries = await prisma.category.upsert({
    where: { name: 'Lithium Batteries' },
    update: {},
    create: {
      name: 'Lithium Batteries',
      description: 'High-performance lithium-ion battery systems',
      parentId: batteries.id
    }
  })

  const leadAcidBatteries = await prisma.category.upsert({
    where: { name: 'Lead Acid Batteries' },
    update: {},
    create: {
      name: 'Lead Acid Batteries',
      description: 'Traditional lead acid battery systems',
      parentId: batteries.id
    }
  })

  console.log('✅ Categories created')
  
  return {
    solarPanels,
    batteries,
    inverters,
    chargeControllers,
    mountingSystems,
    monocrystalline,
    polycrystalline,
    lithiumBatteries,
    leadAcidBatteries
  }
}

async function createProducts(users, categories) {
  console.log('🛍️ Creating products...')
  
  const admin = users.find(u => u.role === 'ADMIN')!
  const seller1 = users.find(u => u.email === 'seller1@voltbay.com')!
  const seller2 = users.find(u => u.email === 'seller2@voltbay.com')!
  
  const productsData = [
    {
      title: 'High-Efficiency 400W Monocrystalline Solar Panel',
      description: 'Premium grade monocrystalline solar panel with 21% efficiency rating. Perfect for residential and commercial installations. Includes 25-year warranty and anti-reflective coating for maximum light absorption.',
      price: 299.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        'https://images.unsplash.com/photo-1624397640887-2409092e0e12?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.monocrystalline.id,
      ownerId: seller1.id,
      isAuction: false,
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      specifications: [
        { name: 'Power Output', value: '400', unit: 'W' },
        { name: 'Efficiency', value: '21.2', unit: '%' },
        { name: 'Dimensions', value: '2008 x 1002 x 35', unit: 'mm' },
        { name: 'Weight', value: '22', unit: 'kg' },
        { name: 'Voltage (Vmp)', value: '40.6', unit: 'V' },
        { name: 'Current (Imp)', value: '9.86', unit: 'A' }
      ]
    },
    {
      title: 'Tesla Powerwall 2 - Home Battery System',
      description: 'Tesla Powerwall 2 home battery system. 13.5 kWh capacity with 5kW continuous power output. Used for 2 years, excellent condition. Includes installation hardware and monitoring app.',
      price: 7500.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
      ],
      status: 'ACTIVE',
      condition: 'GOOD',
      categoryId: categories.lithiumBatteries.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      minimumBid: 7000.00,
      currentBid: 7500.00,
      buyNowPrice: 9000.00,
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      specifications: [
        { name: 'Capacity', value: '13.5', unit: 'kWh' },
        { name: 'Power Output', value: '5', unit: 'kW' },
        { name: 'Efficiency', value: '90', unit: '%' },
        { name: 'Warranty Remaining', value: '8', unit: 'years' },
        { name: 'Operating Temperature', value: '-20 to 50', unit: '°C' }
      ]
    },
    {
      title: '3000W Pure Sine Wave Inverter with Remote Monitoring',
      description: 'High-quality pure sine wave inverter with advanced features. 3000W continuous power, 6000W surge capacity. Perfect for off-grid systems. Includes remote monitoring and LCD display.',
      price: 450.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.inverters.id,
      ownerId: admin.id,
      isAuction: false,
      city: 'Denver',
      state: 'Colorado',
      country: 'USA',
      specifications: [
        { name: 'Continuous Power', value: '3000', unit: 'W' },
        { name: 'Surge Power', value: '6000', unit: 'W' },
        { name: 'Input Voltage', value: '12', unit: 'V DC' },
        { name: 'Output Voltage', value: '120', unit: 'V AC' },
        { name: 'Efficiency', value: '93', unit: '%' }
      ]
    },
    {
      title: '320W Polycrystalline Solar Panel - Budget Friendly',
      description: 'Cost-effective polycrystalline solar panel perfect for budget-conscious installations. Good efficiency and reliable performance with 20-year warranty.',
      price: 189.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1564419434-d6b63c27fac5?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.polycrystalline.id,
      ownerId: seller1.id,
      isAuction: false,
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA',
      specifications: [
        { name: 'Power Output', value: '320', unit: 'W' },
        { name: 'Efficiency', value: '16.8', unit: '%' },
        { name: 'Dimensions', value: '1956 x 992 x 40', unit: 'mm' },
        { name: 'Weight', value: '23', unit: 'kg' }
      ]
    },
    {
      title: 'MPPT Charge Controller 60A - Solar Regulator',
      description: 'Maximum Power Point Tracking charge controller for optimal battery charging. 60A capacity with LCD display and programmable settings. Perfect for 12V/24V systems.',
      price: 156.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.chargeControllers.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      minimumBid: 120.00,
      currentBid: 135.00,
      buyNowPrice: 180.00,
      city: 'Miami',
      state: 'Florida',
      country: 'USA',
      specifications: [
        { name: 'Max Current', value: '60', unit: 'A' },
        { name: 'System Voltage', value: '12/24', unit: 'V' },
        { name: 'Max PV Voltage', value: '150', unit: 'V' },
        { name: 'Efficiency', value: '98', unit: '%' }
      ]
    }
  ]
  
  const products = []
  
  for (const productData of productsData) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { title: productData.title }
    })
    
    if (existingProduct) {
      console.log(`⚠️  Product already exists: ${productData.title}`)
      products.push(existingProduct)
      continue
    }
    
    const { specifications, ...productWithoutSpecs } = productData
    
    const product = await prisma.product.create({
      data: {
        ...productWithoutSpecs,
        specifications: {
          create: specifications
        }
      }
    })
    
    products.push(product)
    console.log(`✅ Product: ${product.title}`)
  }
  
  return products
}

async function createSampleBids(users, products) {
  console.log('💰 Creating sample bids...')
  
  const testUser = users.find(u => u.email === TEST_USER_EMAIL)!
  const admin = users.find(u => u.role === 'ADMIN')!
  
  // Find auction products
  const auctionProducts = products.filter(p => p.isAuction)
  
  if (auctionProducts.length > 0) {
    for (const product of auctionProducts) {
      // Check if bids already exist
      const existingBids = await prisma.bid.findMany({
        where: { productId: product.id }
      })
      
      if (existingBids.length > 0) {
        console.log(`⚠️  Bids already exist for: ${product.title}`)
        continue
      }
      
      // Create sample bids
      await prisma.bid.create({
        data: {
          amount: product.currentBid || product.minimumBid || 100,
          productId: product.id,
          userId: testUser.id
        }
      })
      
      console.log(`✅ Bid created for: ${product.title}`)
    }
  }
}

async function verifyDataIntegrity() {
  console.log('🔍 Verifying data integrity...')
  
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    specifications: await prisma.productSpecification.count(),
    bids: await prisma.bid.count()
  }
  
  console.log('📊 Final counts:')
  console.log(`   Users: ${counts.users}`)
  console.log(`   Categories: ${counts.categories}`)
  console.log(`   Products: ${counts.products}`)
  console.log(`   Specifications: ${counts.specifications}`)
  console.log(`   Bids: ${counts.bids}`)
  
  // Verify critical users exist
  const adminUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  })
  
  if (!adminUser || !adminUser.verified || adminUser.role !== 'ADMIN') {
    throw new Error('Admin user not properly configured')
  }
  
  console.log('✅ Data integrity verified')
}

main()
  .catch((e) => {
    console.error('❌ Error in migration seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 