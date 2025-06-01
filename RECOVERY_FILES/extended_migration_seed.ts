import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuration
const ADMIN_EMAIL = 'admin@voltbay.io'
const ADMIN_PASSWORD = 'Password123'
const TEST_USER_EMAIL = 'testuser@voltbay.com'

// Fake data generators
const generateRandomPrice = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

const generateAuctionEndDate = (minDays: number, maxDays: number): Date => {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

const generateRandomBid = (minBid: number, currentBid: number): number => {
  const increment = Math.random() * 100 + 10 // $10-$110 increment
  return Math.round((currentBid + increment) * 100) / 100
}

async function main() {
  console.log('🌱 Starting Extended Migration-Safe Fake Data Seeding...')
  console.log('======================================================')
  
  try {
    // Step 1: Create comprehensive users
    const users = await createExtendedUsers()
    
    // Step 2: Create detailed categories
    const categories = await createCategories()
    
    // Step 3: Create extensive product catalog
    const products = await createExtendedProducts(users, categories)
    
    // Step 4: Create realistic auction bids
    await createRealisticBids(users, products)
    
    // Step 5: Create sample reviews/feedback
    await createSampleReviews(users, products)
    
    // Step 6: Verify data integrity
    await verifyDataIntegrity()
    
    console.log('\n✅ Extended Migration-Safe Fake Data Seeding Complete!')
    console.log('====================================================')
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

async function createExtendedUsers() {
  console.log('👥 Creating extended user base...')
  
  const usersData = [
    {
      email: ADMIN_EMAIL,
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true
    },
    {
      email: TEST_USER_EMAIL,
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      verified: true
    },
    // Additional test users
    {
      email: 'seller1@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'John',
      lastName: 'Seller',
      role: 'USER',
      verified: true
    },
    {
      email: 'seller2@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Sarah',
      lastName: 'Green',
      role: 'USER',
      verified: true
    },
    {
      email: 'buyer1@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'USER',
      verified: true
    },
    {
      email: 'buyer2@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Lisa',
      lastName: 'Chen',
      role: 'USER',
      verified: true
    },
    {
      email: 'installer@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Robert',
      lastName: 'Smith',
      role: 'USER',
      verified: true
    },
    {
      email: 'unverified@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C',
      firstName: 'Alex',
      lastName: 'Unverified',
      role: 'USER',
      verified: false
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
    console.log(`✅ User: ${user.email} (${user.role}) ${user.verified ? '✓' : '✗'}`)
  }
  
  return users
}

async function createCategories() {
  console.log('📁 Creating detailed categories...')
  
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

  const thinFilm = await prisma.category.upsert({
    where: { name: 'Thin Film Panels' },
    update: {},
    create: {
      name: 'Thin Film Panels',
      description: 'Flexible and lightweight solar panels',
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
    thinFilm,
    lithiumBatteries,
    leadAcidBatteries
  }
}

async function createExtendedProducts(users, categories) {
  console.log('🛍️ Creating extended product catalog...')
  
  const admin = users.find(u => u.role === 'ADMIN')!
  const seller1 = users.find(u => u.email === 'seller1@voltbay.com')!
  const seller2 = users.find(u => u.email === 'seller2@voltbay.com')!
  const installer = users.find(u => u.email === 'installer@voltbay.com')!
  
  const extendedProductsData = [
    // Core products from original seed
    {
      title: 'High-Efficiency 400W Monocrystalline Solar Panel',
      description: 'Premium grade monocrystalline solar panel with 21% efficiency rating. Perfect for residential and commercial installations. Includes 25-year warranty.',
      price: 299.99,
      imageUrls: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'],
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
        { name: 'Weight', value: '22', unit: 'kg' }
      ]
    },
    {
      title: 'Tesla Powerwall 2 - Home Battery System',
      description: 'Tesla Powerwall 2 home battery system. 13.5 kWh capacity with 5kW continuous power output. Used for 2 years, excellent condition.',
      price: 7500.00,
      imageUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      status: 'ACTIVE',
      condition: 'GOOD',
      categoryId: categories.lithiumBatteries.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: generateAuctionEndDate(5, 10),
      minimumBid: 7000.00,
      currentBid: 7500.00,
      buyNowPrice: 9000.00,
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      specifications: [
        { name: 'Capacity', value: '13.5', unit: 'kWh' },
        { name: 'Power Output', value: '5', unit: 'kW' },
        { name: 'Efficiency', value: '90', unit: '%' }
      ]
    },
    // Additional products for testing
    {
      title: 'LG NeON 2 365W Solar Panel - High Performance',
      description: 'LG NeON 2 series solar panel with 21.1% efficiency. Excellent for space-constrained installations. 25-year product warranty.',
      price: generateRandomPrice(320, 380),
      imageUrls: ['https://images.unsplash.com/photo-1624397640887-2409092e0e12?w=800'],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.monocrystalline.id,
      ownerId: installer.id,
      isAuction: false,
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      specifications: [
        { name: 'Power Output', value: '365', unit: 'W' },
        { name: 'Efficiency', value: '21.1', unit: '%' },
        { name: 'Temperature Coefficient', value: '-0.38', unit: '%/°C' }
      ]
    },
    {
      title: 'Canadian Solar 450W Bi-facial Panel',
      description: 'Bi-facial solar panel that generates power from both sides. Perfect for ground-mount systems with high albedo.',
      price: generateRandomPrice(400, 500),
      imageUrls: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.monocrystalline.id,
      ownerId: seller1.id,
      isAuction: true,
      auctionEndDate: generateAuctionEndDate(2, 7),
      minimumBid: 400.00,
      currentBid: 420.00,
      buyNowPrice: 500.00,
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA',
      specifications: [
        { name: 'Power Output (Front)', value: '450', unit: 'W' },
        { name: 'Power Output (Rear)', value: '90', unit: 'W' },
        { name: 'Efficiency', value: '20.9', unit: '%' }
      ]
    },
    {
      title: 'Enphase IQ8+ Microinverter (Set of 10)',
      description: 'Grid-tied microinverters with rapid shutdown capability. Perfect for residential installations. Includes 25-year warranty.',
      price: generateRandomPrice(1800, 2200),
      imageUrls: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.inverters.id,
      ownerId: admin.id,
      isAuction: false,
      city: 'Sacramento',
      state: 'California',
      country: 'USA',
      specifications: [
        { name: 'Max AC Power', value: '300', unit: 'W' },
        { name: 'Efficiency', value: '97.0', unit: '%' },
        { name: 'Operating Temperature', value: '-40 to 65', unit: '°C' }
      ]
    },
    {
      title: 'Victron Energy MPPT 100/50 Charge Controller',
      description: 'Advanced MPPT charge controller with Bluetooth monitoring. Perfect for off-grid systems up to 700W solar input.',
      price: generateRandomPrice(180, 250),
      imageUrls: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
      status: 'ACTIVE',
      condition: 'GOOD',
      categoryId: categories.chargeControllers.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: generateAuctionEndDate(1, 5),
      minimumBid: 150.00,
      currentBid: 165.00,
      buyNowPrice: 220.00,
      city: 'Portland',
      state: 'Oregon',
      country: 'USA',
      specifications: [
        { name: 'Max Charge Current', value: '50', unit: 'A' },
        { name: 'Max PV Voltage', value: '100', unit: 'V' },
        { name: 'Efficiency', value: '98', unit: '%' }
      ]
    },
    {
      title: 'Battle Born 100Ah LiFePO4 Battery',
      description: 'Deep cycle lithium iron phosphate battery. 3000+ cycles, built-in BMS, 10-year warranty. Perfect for RV and marine applications.',
      price: generateRandomPrice(900, 1100),
      imageUrls: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.lithiumBatteries.id,
      ownerId: installer.id,
      isAuction: false,
      city: 'Las Vegas',
      state: 'Nevada',
      country: 'USA',
      specifications: [
        { name: 'Capacity', value: '100', unit: 'Ah' },
        { name: 'Voltage', value: '12.8', unit: 'V' },
        { name: 'Cycle Life', value: '3000+', unit: 'cycles' }
      ]
    },
    {
      title: 'Renogy 320W Flexible Solar Panel',
      description: 'Ultra-thin flexible solar panel perfect for curved surfaces. Great for RVs, boats, and unconventional installations.',
      price: generateRandomPrice(250, 350),
      imageUrls: ['https://images.unsplash.com/photo-1564419434-d6b63c27fac5?w=800'],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: categories.thinFilm.id,
      ownerId: seller1.id,
      isAuction: false,
      city: 'Denver',
      state: 'Colorado',
      country: 'USA',
      specifications: [
        { name: 'Power Output', value: '320', unit: 'W' },
        { name: 'Thickness', value: '2.5', unit: 'mm' },
        { name: 'Bend Radius', value: '248', unit: 'mm' }
      ]
    }
  ]
  
  const products = []
  
  for (const productData of extendedProductsData) {
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
    console.log(`✅ Product: ${product.title} ${product.isAuction ? '🔥' : '💰'}`)
  }
  
  return products
}

async function createRealisticBids(users, products) {
  console.log('💰 Creating realistic auction bids...')
  
  const bidders = users.filter(u => u.verified && u.role === 'USER')
  const auctionProducts = products.filter(p => p.isAuction)
  
  for (const product of auctionProducts) {
    // Check if bids already exist
    const existingBids = await prisma.bid.findMany({
      where: { productId: product.id }
    })
    
    if (existingBids.length > 0) {
      console.log(`⚠️  Bids already exist for: ${product.title}`)
      continue
    }
    
    // Create 2-5 realistic bids per auction
    const numBids = Math.floor(Math.random() * 4) + 2
    let currentBidAmount = product.minimumBid || 100
    
    for (let i = 0; i < numBids; i++) {
      const randomBidder = bidders[Math.floor(Math.random() * bidders.length)]
      
      // Skip if this user already bid on this item
      const existingUserBid = await prisma.bid.findFirst({
        where: {
          productId: product.id,
          userId: randomBidder.id
        }
      })
      
      if (existingUserBid) continue
      
      currentBidAmount = generateRandomBid(product.minimumBid || 100, currentBidAmount)
      
      await prisma.bid.create({
        data: {
          amount: currentBidAmount,
          productId: product.id,
          userId: randomBidder.id,
          createdAt: new Date(Date.now() - (numBids - i) * 60 * 60 * 1000) // Spread bids over time
        }
      })
      
      // Update product's current bid
      await prisma.product.update({
        where: { id: product.id },
        data: { currentBid: currentBidAmount }
      })
    }
    
    console.log(`✅ Created ${numBids} bids for: ${product.title} (Current: $${currentBidAmount})`)
  }
}

async function createSampleReviews(users, products) {
  console.log('⭐ Creating sample reviews...')
  
  // This would require a reviews table in your schema
  // For now, we'll just log that this feature could be added
  console.log('📝 Review system not implemented in current schema')
  console.log('💡 Consider adding reviews/ratings table for future iterations')
}

async function verifyDataIntegrity() {
  console.log('🔍 Verifying data integrity...')
  
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    specifications: await prisma.productSpecification.count(),
    bids: await prisma.bid.count(),
    auctions: await prisma.product.count({ where: { isAuction: true } })
  }
  
  console.log('📊 Final counts:')
  console.log(`   Users: ${counts.users}`)
  console.log(`   Categories: ${counts.categories}`)
  console.log(`   Products: ${counts.products} (${counts.auctions} auctions)`)
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
    console.error('❌ Error in extended migration seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 