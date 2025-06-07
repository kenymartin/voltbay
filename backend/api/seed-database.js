const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Sample users data
const users = [
  {
    email: 'admin@voltbay.com',
    password: 'password123', // This will be hashed by the auth service
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    phone: '+1234567890',
    street: '123 Admin St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA'
  },
  {
    email: 'john.doe@email.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    phone: '+1987654321',
    street: '456 Seller Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    country: 'USA'
  },
  {
    email: 'jane.smith@email.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'USER',
    phone: '+1555666777',
    street: '789 Buyer Blvd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA'
  },
  {
    email: 'mike.wilson@email.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'USER',
    phone: '+1444555666',
    street: '321 Solar St',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    country: 'USA'
  },
  {
    email: 'sarah.johnson@email.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'USER',
    phone: '+1333444555',
    street: '654 Green Way',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA'
  }
]

// Main categories
const categories = [
  {
    name: 'Solar Panels',
    description: 'Photovoltaic panels for converting sunlight to electricity',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Inverters',
    description: 'Convert DC power from solar panels to AC power for home use',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Batteries',
    description: 'Energy storage systems for solar power',
    imageUrl: 'https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Mounting Systems',
    description: 'Hardware for securely installing solar panels',
    imageUrl: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Monitoring Systems',
    description: 'Track and optimize your solar energy production',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center'
  },
  {
    name: 'Accessories',
    description: 'Additional components and tools for solar installations',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&crop=center'
  }
]

// Products data
const products = [
  // Solar Panels
  {
    title: 'SunPower Maxeon 3 400W Solar Panel',
    description: 'Premium monocrystalline solar panel with industry-leading efficiency of 22.6%. Features copper foundation for superior reliability and 25-year complete confidence warranty.',
    price: 299.99,
    condition: 'NEW',
    categoryName: 'Solar Panels',
    ownerEmail: 'john.doe@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Wattage', value: '400W', unit: 'W' },
      { name: 'Efficiency', value: '22.6', unit: '%' },
      { name: 'Voltage', value: '67.3', unit: 'V' },
      { name: 'Current', value: '5.94', unit: 'A' },
      { name: 'Dimensions', value: '1690x1046x35', unit: 'mm' },
      { name: 'Weight', value: '19.5', unit: 'kg' },
      { name: 'Warranty', value: '25', unit: 'years' }
    ],
    street: '456 Seller Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    country: 'USA'
  },
  {
    title: 'LG NeON R 365W Bifacial Solar Panel',
    description: 'High-performance bifacial solar panel that captures sunlight from both sides. Advanced cell technology delivers up to 20% additional power from rear side illumination.',
    price: 245.50,
    condition: 'NEW',
    categoryName: 'Solar Panels',
    ownerEmail: 'jane.smith@email.com',
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    minimumBid: 200.00,
    currentBid: 220.00,
    buyNowPrice: 245.50,
    imageUrls: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop&crop=top'],
    specifications: [
      { name: 'Wattage', value: '365W', unit: 'W' },
      { name: 'Efficiency', value: '21.4', unit: '%' },
      { name: 'Voltage', value: '41.4', unit: 'V' },
      { name: 'Current', value: '8.81', unit: 'A' },
      { name: 'Dimensions', value: '1700x1016x35', unit: 'mm' },
      { name: 'Weight', value: '18.5', unit: 'kg' },
      { name: 'Warranty', value: '25', unit: 'years' }
    ],
    street: '789 Buyer Blvd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA'
  },
  {
    title: 'Canadian Solar 320W Polycrystalline Panel',
    description: 'Reliable and cost-effective polycrystalline solar panel. Excellent value for money with solid performance and 12-year product warranty.',
    price: 159.99,
    condition: 'FAIR',
    categoryName: 'Solar Panels',
    ownerEmail: 'mike.wilson@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1565963124321-b6d09b3c1a67?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Wattage', value: '320W', unit: 'W' },
      { name: 'Efficiency', value: '16.5', unit: '%' },
      { name: 'Voltage', value: '37.8', unit: 'V' },
      { name: 'Current', value: '8.47', unit: 'A' },
      { name: 'Dimensions', value: '1650x992x35', unit: 'mm' },
      { name: 'Weight', value: '18.2', unit: 'kg' },
      { name: 'Warranty', value: '12', unit: 'years' }
    ],
    street: '321 Solar St',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    country: 'USA'
  },

  // Inverters
  {
    title: 'SMA Sunny Boy 7.7kW String Inverter',
    description: 'High-efficiency string inverter with integrated rapid shutdown and arc fault circuit protection. Perfect for residential installations up to 7.7kW.',
    price: 1299.99,
    condition: 'NEW',
    categoryName: 'Inverters',
    ownerEmail: 'sarah.johnson@email.com',
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    minimumBid: 1000.00,
    currentBid: 1150.00,
    buyNowPrice: 1299.99,
    imageUrls: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Power', value: '7.7', unit: 'kW' },
      { name: 'Efficiency', value: '97.5', unit: '%' },
      { name: 'Input Voltage', value: '580', unit: 'V max' },
      { name: 'Output Voltage', value: '240', unit: 'V' },
      { name: 'Warranty', value: '12', unit: 'years' }
    ],
    street: '654 Green Way',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA'
  },
  {
    title: 'Enphase IQ7+ Microinverter (Set of 12)',
    description: 'Complete set of 12 Enphase IQ7+ microinverters for panel-level optimization. Each unit handles up to 290W with built-in monitoring and rapid shutdown.',
    price: 1680.00,
    condition: 'NEW',
    categoryName: 'Inverters',
    ownerEmail: 'john.doe@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&crop=top'],
    specifications: [
      { name: 'Power', value: '290', unit: 'W per unit' },
      { name: 'Efficiency', value: '97.5', unit: '%' },
      { name: 'Quantity', value: '12', unit: 'units' },
      { name: 'Input Voltage', value: '16-48', unit: 'V' },
      { name: 'Output Voltage', value: '240', unit: 'V' },
      { name: 'Warranty', value: '25', unit: 'years' }
    ],
    street: '456 Seller Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    country: 'USA'
  },

  // Batteries
  {
    title: 'Tesla Powerwall 2 13.5kWh Battery',
    description: 'Integrated lithium-ion battery system with built-in inverter. Stores solar energy for use when the sun isnt shining. Includes gateway and mobile app monitoring.',
    price: 6500.00,
    condition: 'LIKE_NEW',
    categoryName: 'Batteries',
    ownerEmail: 'jane.smith@email.com',
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    minimumBid: 5000.00,
    currentBid: 5750.00,
    buyNowPrice: 6500.00,
    imageUrls: ['https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Capacity', value: '13.5', unit: 'kWh' },
      { name: 'Power', value: '5', unit: 'kW continuous' },
      { name: 'Efficiency', value: '90', unit: '%' },
      { name: 'Voltage', value: '350-450', unit: 'V' },
      { name: 'Chemistry', value: 'Lithium-ion', unit: '' },
      { name: 'Warranty', value: '10', unit: 'years' }
    ],
    street: '789 Buyer Blvd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA'
  },
  {
    title: 'LG Chem RESU 10H Battery System',
    description: 'Compact lithium-ion battery system designed for daily cycling. High voltage system compatible with SMA and SolarEdge hybrid inverters.',
    price: 4299.99,
    condition: 'NEW',
    categoryName: 'Batteries',
    ownerEmail: 'mike.wilson@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=600&h=400&fit=crop&crop=top'],
    specifications: [
      { name: 'Capacity', value: '9.8', unit: 'kWh usable' },
      { name: 'Voltage', value: '400', unit: 'V' },
      { name: 'Chemistry', value: 'Lithium-ion NCM', unit: '' },
      { name: 'Cycles', value: '6000+', unit: 'cycles' },
      { name: 'Warranty', value: '10', unit: 'years' },
      { name: 'Weight', value: '97', unit: 'kg' }
    ],
    street: '321 Solar St',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    country: 'USA'
  },

  // Mounting Systems
  {
    title: 'IronRidge XR Rail Mounting System',
    description: 'Complete roof mounting kit for 20 panels. Includes XR rails, end caps, bonding hardware, and UFO fasteners. Suitable for composition shingle roofs.',
    price: 890.00,
    condition: 'NEW',
    categoryName: 'Mounting Systems',
    ownerEmail: 'sarah.johnson@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Panel Capacity', value: '20', unit: 'panels' },
      { name: 'Material', value: 'Aluminum', unit: '' },
      { name: 'Roof Type', value: 'Composition shingle', unit: '' },
      { name: 'Wind Load', value: '150', unit: 'mph' },
      { name: 'Snow Load', value: '60', unit: 'psf' },
      { name: 'Warranty', value: '25', unit: 'years' }
    ],
    street: '654 Green Way',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA'
  },
  {
    title: 'SnapNrack Ground Mount System',
    description: 'Ballasted ground mount system for 12 panels. No ground penetration required. Quick installation with pre-assembled components.',
    price: 1250.00,
    condition: 'GOOD',
    categoryName: 'Mounting Systems',
    ownerEmail: 'john.doe@email.com',
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    minimumBid: 900.00,
    currentBid: 1050.00,
    buyNowPrice: 1250.00,
    imageUrls: ['https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=400&fit=crop&crop=top'],
    specifications: [
      { name: 'Panel Capacity', value: '12', unit: 'panels' },
      { name: 'Foundation', value: 'Ballasted', unit: '' },
      { name: 'Tilt', value: '20-30', unit: 'degrees' },
      { name: 'Material', value: 'Aluminum/Steel', unit: '' },
      { name: 'Wind Load', value: '120', unit: 'mph' },
      { name: 'Warranty', value: '20', unit: 'years' }
    ],
    street: '456 Seller Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '73301',
    country: 'USA'
  },

  // Monitoring Systems
  {
    title: 'SolarEdge Monitoring Portal Access',
    description: 'Professional monitoring system with real-time panel-level monitoring. Includes production data, performance analytics, and mobile app access.',
    price: 299.99,
    condition: 'NEW',
    categoryName: 'Monitoring Systems',
    ownerEmail: 'jane.smith@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Connectivity', value: 'Ethernet/WiFi/Cellular', unit: '' },
      { name: 'Compatibility', value: 'SolarEdge systems', unit: '' },
      { name: 'Warranty', value: '12', unit: 'years' }
    ],
    street: '789 Buyer Blvd',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    country: 'USA'
  },

  // Accessories
  {
    title: 'MC4 Connector Set (50 pairs)',
    description: 'Professional grade MC4 connectors for solar panel connections. IP67 rated, TUV certified. Includes 50 male and 50 female connectors.',
    price: 89.99,
    condition: 'NEW',
    categoryName: 'Accessories',
    ownerEmail: 'mike.wilson@email.com',
    isAuction: false,
    imageUrls: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop&crop=center'],
    specifications: [
      { name: 'Quantity', value: '50', unit: 'pairs' },
      { name: 'Rating', value: 'IP67', unit: '' },
      { name: 'Current', value: '30', unit: 'A' },
      { name: 'Voltage', value: '1000', unit: 'V DC' },
      { name: 'Temperature', value: '-40°C to +85°C', unit: '' },
      { name: 'Certification', value: 'TUV, UL', unit: '' }
    ],
    street: '321 Solar St',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    country: 'USA'
  },
  {
    title: 'DC Disconnect Switch 60A',
    description: 'Safety disconnect switch for solar DC systems. Required by electrical code for safe maintenance and emergency shutdown.',
    price: 125.00,
    condition: 'NEW',
    categoryName: 'Accessories',
    ownerEmail: 'sarah.johnson@email.com',
    isAuction: true,
    auctionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    minimumBid: 80.00,
    currentBid: 95.00,
    buyNowPrice: 125.00,
    imageUrls: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=400&fit=crop&crop=top'],
    specifications: [
      { name: 'Current', value: '60', unit: 'A' },
      { name: 'Voltage', value: '600', unit: 'V DC' },
      { name: 'Poles', value: '2', unit: 'pole' },
      { name: 'Enclosure', value: 'NEMA 3R', unit: '' },
      { name: 'Certification', value: 'UL 508', unit: '' }
    ],
    street: '654 Green Way',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'USA'
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.bid.deleteMany()
    await prisma.productSpecification.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Seed users
    console.log('👥 Seeding users...')
    const createdUsers = {}
    for (const userData of users) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      createdUsers[user.email] = user
      console.log(`   ✓ Created user: ${user.email} (role: ${user.role})`)
    }

    // Seed categories
    console.log('📂 Seeding categories...')
    const createdCategories = {}
    
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      createdCategories[category.name] = category
      console.log(`   ✓ Created category: ${category.name}`)
    }

    // Seed products
    console.log('📦 Seeding products...')
    const createdProducts = []
    
    for (const productData of products) {
      const { categoryName, ownerEmail, specifications, ...prodData } = productData
      
      const owner = createdUsers[ownerEmail]
      const category = createdCategories[categoryName]

      if (!owner || !category) {
        console.log(`   ⚠️  Skipping product "${productData.title}" - missing dependencies`)
        continue
      }

      const product = await prisma.product.create({
        data: {
          ...prodData,
          ownerId: owner.id,
          categoryId: category.id,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      // Create specifications
      if (specifications) {
        for (const spec of specifications) {
          await prisma.productSpecification.create({
            data: {
              productId: product.id,
              ...spec
            }
          })
        }
      }
      
      createdProducts.push(product)
      console.log(`   ✓ Created ${product.isAuction ? 'auction' : 'product'}: ${product.title}`)
    }

    // Seed some bids for auction items
    console.log('💰 Seeding auction bids...')
    const auctionProducts = createdProducts.filter(p => p.isAuction)
    
    for (const auction of auctionProducts) {
      // Add some realistic bids
      const bidders = Object.values(createdUsers).filter(u => u.id !== auction.ownerId)
      const numBids = Math.floor(Math.random() * 3) + 1 // 1-3 bids per auction
      
      for (let i = 0; i < numBids && i < bidders.length; i++) {
        const bidder = bidders[i]
        const bidAmount = parseFloat(auction.minimumBid) + (i + 1) * 25 // Increment bids
        
        await prisma.bid.create({
          data: {
            userId: bidder.id,
            productId: auction.id,
            amount: bidAmount,
            isWinning: i === numBids - 1, // Last bid is winning
            createdAt: new Date(Date.now() - (numBids - i) * 60 * 60 * 1000) // Stagger bid times
          }
        })
        
        // Update auction current bid
        if (i === numBids - 1) {
          await prisma.product.update({
            where: { id: auction.id },
            data: { currentBid: bidAmount }
          })
        }
        
        console.log(`   ✓ Added bid of $${bidAmount} on "${auction.title}"`)
      }
    }

    const userCount = await prisma.user.count()
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const auctionCount = await prisma.product.count({ where: { isAuction: true } })
    const bidCount = await prisma.bid.count()

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   📂 Categories: ${categoryCount}`)
    console.log(`   📦 Products: ${productCount}`)
    console.log(`   🏷️  Auctions: ${auctionCount}`)
    console.log(`   💰 Bids: ${bidCount}`)
    console.log('\n✅ Ready to test your VoltBay marketplace!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 