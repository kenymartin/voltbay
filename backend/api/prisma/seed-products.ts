import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🛍️ Seeding products...')

  // Get existing users
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@voltbay.com' }
  })
  
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })

  if (!adminUser) {
    console.error('❌ Admin user not found. Please run auth service seed first.')
    return
  }

  // Get existing categories
  const solarPanelsCategory = await prisma.category.findFirst({
    where: { name: 'Solar Panels' }
  })
  
  const batteriesCategory = await prisma.category.findFirst({
    where: { name: 'Batteries' }
  })
  
  const invertersCategory = await prisma.category.findFirst({
    where: { name: 'Inverters' }
  })

  if (!solarPanelsCategory || !batteriesCategory || !invertersCategory) {
    console.error('❌ Categories not found. Creating basic categories first...')
    
    // Create basic categories if they don't exist
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
  }

  // Create sample products
  console.log('📦 Creating sample products...')
  
  const product1 = await prisma.product.create({
    data: {
      title: 'High-Efficiency 400W Monocrystalline Solar Panel',
      description: 'Premium grade monocrystalline solar panel with 21% efficiency rating. Perfect for residential and commercial installations. Includes 25-year warranty.',
      price: 299.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
        'https://images.unsplash.com/photo-1624397640887-2409092e0e12?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: solarPanelsCategory?.id || 'default',
      ownerId: adminUser.id,
      isAuction: false,
      city: 'San Francisco',
      state: 'California',
      country: 'USA'
    }
  })

  const product2 = await prisma.product.create({
    data: {
      title: 'Tesla Powerwall 2 - Home Battery System (Auction)',
      description: 'Tesla Powerwall 2 home battery system. 13.5 kWh capacity with 5kW continuous power output. Used for 2 years, excellent condition.',
      price: 7500.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
      ],
      status: 'ACTIVE',
      condition: 'GOOD',
      categoryId: batteriesCategory?.id || 'default',
      ownerId: adminUser.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      minimumBid: 7000.00,
      currentBid: 7500.00,
      buyNowPrice: 9000.00,
      city: 'Austin',
      state: 'Texas',
      country: 'USA'
    }
  })

  const product3 = await prisma.product.create({
    data: {
      title: '3000W Pure Sine Wave Inverter',
      description: 'High-quality pure sine wave inverter. 3000W continuous power, 6000W surge. Perfect for off-grid systems.',
      price: 450.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: invertersCategory?.id || 'default',
      ownerId: adminUser.id,
      isAuction: false,
      city: 'Denver',
      state: 'Colorado',
      country: 'USA'
    }
  })

  const product4 = await prisma.product.create({
    data: {
      title: '320W Polycrystalline Solar Panel - Budget Friendly',
      description: 'Cost-effective polycrystalline solar panel perfect for budget installations. Good efficiency and reliable performance.',
      price: 189.99,
      imageUrls: [
        'https://images.unsplash.com/photo-1564419434-d6b63c27fac5?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: solarPanelsCategory?.id || 'default',
      ownerId: testUser?.id || adminUser.id,
      isAuction: false,
      city: 'Phoenix',
      state: 'Arizona',
      country: 'USA'
    }
  })

  const product5 = await prisma.product.create({
    data: {
      title: 'MPPT Charge Controller 60A (Auction)',
      description: 'Maximum Power Point Tracking charge controller for optimal battery charging. 60A capacity with LCD display.',
      price: 156.00,
      imageUrls: [
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
      ],
      status: 'ACTIVE',
      condition: 'NEW',
      categoryId: batteriesCategory?.id || 'default',
      ownerId: adminUser.id,
      isAuction: true,
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      minimumBid: 120.00,
      currentBid: 135.00,
      buyNowPrice: 180.00,
      city: 'Miami',
      state: 'Florida',
      country: 'USA'
    }
  })

  // Create specifications for products
  console.log('📋 Creating product specifications...')
  
  await prisma.productSpecification.createMany({
    data: [
      // Product 1 specs
      { productId: product1.id, name: 'Power Output', value: '400', unit: 'W' },
      { productId: product1.id, name: 'Efficiency', value: '21.2', unit: '%' },
      { productId: product1.id, name: 'Dimensions', value: '2008 x 1002 x 35', unit: 'mm' },
      { productId: product1.id, name: 'Weight', value: '22', unit: 'kg' },
      
      // Product 2 specs
      { productId: product2.id, name: 'Capacity', value: '13.5', unit: 'kWh' },
      { productId: product2.id, name: 'Power Output', value: '5', unit: 'kW' },
      { productId: product2.id, name: 'Efficiency', value: '90', unit: '%' },
      
      // Product 3 specs
      { productId: product3.id, name: 'Continuous Power', value: '3000', unit: 'W' },
      { productId: product3.id, name: 'Surge Power', value: '6000', unit: 'W' },
      { productId: product3.id, name: 'Input Voltage', value: '12', unit: 'V DC' },
      
      // Product 4 specs
      { productId: product4.id, name: 'Power Output', value: '320', unit: 'W' },
      { productId: product4.id, name: 'Efficiency', value: '16.8', unit: '%' },
      
      // Product 5 specs
      { productId: product5.id, name: 'Max Current', value: '60', unit: 'A' },
      { productId: product5.id, name: 'System Voltage', value: '12/24', unit: 'V' }
    ]
  })

  // Create some sample bids for auction items
  if (testUser) {
    console.log('💰 Creating sample bids...')
    await prisma.bid.create({
      data: {
        amount: 7500.00,
        productId: product2.id,
        userId: testUser.id
      }
    })

    await prisma.bid.create({
      data: {
        amount: 135.00,
        productId: product5.id,
        userId: testUser.id
      }
    })
  }

  console.log('✅ Products seeded successfully!')
  console.log('📊 Created:')
  console.log('  - 5 products (2 auctions, 3 direct sales)')
  console.log('  - 14 product specifications')
  console.log('  - 2 sample bids')
  console.log('')
  console.log('🛍️ Products available on marketplace!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 