import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with comprehensive fake data...')

  // Create categories
  console.log('📁 Creating categories...')
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

  // Create subcategories
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

  // Create users
  console.log('👥 Creating users...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@voltbay.com' },
    update: {},
    create: {
      email: 'admin@voltbay.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true
    }
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      email: 'testuser@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Test',
      lastName: 'User',
      role: 'BUYER',
      verified: true
    }
  })

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    update: {},
    create: {
      email: 'seller1@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'John',
      lastName: 'Seller',
      role: 'VENDOR',
      verified: true
    }
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    update: {},
    create: {
      email: 'seller2@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Sarah',
      lastName: 'Green',
      role: 'VENDOR',
      verified: true
    }
  })

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@example.com' },
    update: {},
    create: {
      email: 'buyer1@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'BUYER',
      verified: true
    }
  })

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@example.com' },
    update: {},
    create: {
      email: 'buyer2@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Lisa',
      lastName: 'Davis',
      role: 'BUYER',
      verified: true
    }
  })

  const bidder1 = await prisma.user.upsert({
    where: { email: 'bidder1@example.com' },
    update: {},
    create: {
      email: 'bidder1@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Alex',
      lastName: 'Thompson',
      role: 'BUYER',
      verified: true
    }
  })

  const bidder2 = await prisma.user.upsert({
    where: { email: 'bidder2@example.com' },
    update: {},
    create: {
      email: 'bidder2@example.com',
      password: '$2a$12$lalQSfLY.YvKH6D.lObEI.3zSdIQq04s./ZotMbkUAqbws4xe5A3C', // password123
      firstName: 'Emma',
      lastName: 'Wilson',
      role: 'BUYER',
      verified: true
    }
  })

  // Create sample products
  console.log('🛍️ Creating sample products...')
  
  // Solar Panels
  const product1 = await prisma.product.create({
    data: {
      title: 'High-Efficiency 400W Monocrystalline Solar Panel',
      description: 'Premium grade monocrystalline solar panel with 21% efficiency rating. Perfect for residential and commercial installations. Includes 25-year warranty and anti-reflective coating for maximum light absorption.',
      price: 299.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        'https://images.unsplash.com/photo-1624397640887-2409092e0e12?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: monocrystalline.id,
      ownerId: seller1.id,
      isAuction: false,
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Power Output', value: '400', unit: 'W' },
          { name: 'Efficiency', value: '21.2', unit: '%' },
          { name: 'Dimensions', value: '2008 x 1002 x 35', unit: 'mm' },
          { name: 'Weight', value: '22', unit: 'kg' },
          { name: 'Voltage (Vmp)', value: '40.6', unit: 'V' },
          { name: 'Current (Imp)', value: '9.86', unit: 'A' }
        ]
      }
    }
  })

  const product2 = await prisma.product.create({
    data: {
      title: 'Tesla Powerwall 2 - Home Battery System',
      description: 'Tesla Powerwall 2 home battery system. 13.5 kWh capacity with 5kW continuous power output. Used for 2 years, excellent condition. Includes installation hardware and monitoring app.',
      price: 7500.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
      ],
      status: 'ACTIVE',
      condition: 'GOOD',
      categoryId: lithiumBatteries.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      minimumBid: 7000.00,
      currentBid: 7500.00,
      buyNowPrice: 9000.00,
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Capacity', value: '13.5', unit: 'kWh' },
          { name: 'Power Output', value: '5', unit: 'kW' },
          { name: 'Efficiency', value: '90', unit: '%' },
          { name: 'Warranty Remaining', value: '8', unit: 'years' },
          { name: 'Operating Temperature', value: '-20 to 50', unit: '°C' }
        ]
      }
    }
  })

  const product3 = await prisma.product.create({
    data: {
      title: '3000W Pure Sine Wave Inverter with Remote Monitoring',
      description: 'High-quality pure sine wave inverter with advanced features. 3000W continuous power, 6000W surge capacity. Perfect for off-grid systems. Includes remote monitoring and LCD display.',
      price: 450.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: inverters.id,
      ownerId: adminUser.id,
      isAuction: false,
      city: 'Denver',
      state: 'Colorado',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Continuous Power', value: '3000', unit: 'W' },
          { name: 'Surge Power', value: '6000', unit: 'W' },
          { name: 'Input Voltage', value: '12', unit: 'V DC' },
          { name: 'Output Voltage', value: '120', unit: 'V AC' },
          { name: 'Efficiency', value: '93', unit: '%' }
        ]
      }
    }
  })

  const product4 = await prisma.product.create({
    data: {
      title: '320W Polycrystalline Solar Panel - Budget Friendly',
      description: 'Cost-effective polycrystalline solar panel perfect for budget-conscious installations. Good efficiency and reliable performance with 20-year warranty.',
      price: 189.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1564419434-d6b63c27fac5?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: polycrystalline.id,
      ownerId: seller1.id,
      isAuction: false,
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Power Output', value: '320', unit: 'W' },
          { name: 'Efficiency', value: '16.8', unit: '%' },
          { name: 'Dimensions', value: '1956 x 992 x 40', unit: 'mm' },
          { name: 'Weight', value: '23', unit: 'kg' }
        ]
      }
    }
  })

  const product5 = await prisma.product.create({
    data: {
      title: 'MPPT Charge Controller 60A - Solar Regulator',
      description: 'Maximum Power Point Tracking charge controller for optimal battery charging. 60A capacity with LCD display and programmable settings. Perfect for 12V/24V systems.',
      price: 156.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: chargeControllers.id,
      ownerId: seller2.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      minimumBid: 120.00,
      currentBid: 140.00,
      buyNowPrice: 180.00,
      city: 'Miami',
      state: 'Florida',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Max Current', value: '60', unit: 'A' },
          { name: 'System Voltage', value: '12/24', unit: 'V' },
          { name: 'Max PV Voltage', value: '150', unit: 'V' },
          { name: 'Efficiency', value: '98', unit: '%' }
        ]
      }
    }
  })

  const product6 = await prisma.product.create({
    data: {
      title: 'Roof Mounting Rails Kit - 10 Panel System',
      description: 'Complete roof mounting system for 10 solar panels. Includes rails, clamps, and all necessary hardware. Suitable for asphalt shingle roofs.',
      price: 285.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1622541948011-8c8b76bb8b63?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: mountingSystems.id,
      ownerId: testUser.id,
      isAuction: false,
      city: 'Seattle',
      state: 'Washington',
      country: 'USA',
      specifications: {
        create: [
          { name: 'Panel Capacity', value: '10', unit: 'panels' },
          { name: 'Material', value: 'Aluminum', unit: '' },
          { name: 'Roof Type', value: 'Asphalt Shingle', unit: '' },
          { name: 'Wind Rating', value: '150', unit: 'mph' }
        ]
      }
    }
  })

  // Create some sample bids for auction items
  console.log('💰 Creating sample bids...')
  
  // Bids on Tesla Powerwall 2 (product2)
  await prisma.bid.create({
    data: {
      amount: 7200.00,
      productId: product2.id,
      userId: bidder1.id
    }
  })

  await prisma.bid.create({
    data: {
      amount: 7350.00,
      productId: product2.id,
      userId: bidder2.id
    }
  })

  await prisma.bid.create({
    data: {
      amount: 7500.00,
      productId: product2.id,
      userId: testUser.id
    }
  })

  // Bids on MPPT Charge Controller (product5)
  await prisma.bid.create({
    data: {
      amount: 125.00,
      productId: product5.id,
      userId: bidder1.id
    }
  })

  await prisma.bid.create({
    data: {
      amount: 135.00,
      productId: product5.id,
      userId: bidder2.id
    }
  })

  await prisma.bid.create({
    data: {
      amount: 140.00,
      productId: product5.id,
      userId: buyer1.id
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created:')
  console.log('  - 5 main categories with subcategories')
  console.log('  - 8 users (admin, test user, 2 sellers, 2 buyers, 2 bidders)')
  console.log('  - 6 products (2 auctions, 4 direct sales)')
  console.log('  - 25+ product specifications')
  console.log('  - 6 sample bids')
  console.log('')
  console.log('🔑 Test accounts:')
  console.log('  - Admin: admin@voltbay.com / password123')
  console.log('  - Test User: testuser@example.com / password123')
  console.log('  - Seller 1: seller1@example.com / password123')
  console.log('  - Seller 2: seller2@example.com / password123')
  console.log('  - Buyer 1: buyer1@example.com / password123')
  console.log('  - Buyer 2: buyer2@example.com / password123')
  console.log('  - Bidder 1: bidder1@example.com / password123')
  console.log('  - Bidder 2: bidder2@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 