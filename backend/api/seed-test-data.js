const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating test data for VoltBay...')

  try {
    // Clean existing data
    await prisma.bid.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    // Create categories with better structure
    const categories = [
      {
        name: 'Solar Panels',
        description: 'High-efficiency photovoltaic panels for converting sunlight to electricity',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        subcategories: [
          'Monocrystalline Panels',
          'Polycrystalline Panels', 
          'Thin Film Panels',
          'Bifacial Panels'
        ]
      },
      {
        name: 'Inverters',
        description: 'Convert DC power from solar panels to AC power for your home',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
        subcategories: [
          'String Inverters',
          'Power Optimizers',
          'Microinverters',
          'Central Inverters'
        ]
      },
      {
        name: 'Batteries',
        description: 'Energy storage solutions for solar power systems',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        subcategories: [
          'Lithium-Ion Batteries',
          'Lead Acid Batteries',
          'Saltwater Batteries',
          'Flow Batteries'
        ]
      },
      {
        name: 'Mounting Systems',
        description: 'Professional mounting hardware for solar panel installation',
        imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop',
        subcategories: [
          'Roof Mounting',
          'Ground Mounting',
          'Pole Mounting',
          'Tracking Systems'
        ]
      },
      {
        name: 'Charge Controllers',
        description: 'Regulate power flow from solar panels to batteries',
        imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
        subcategories: [
          'PWM Controllers',
          'MPPT Controllers',
          'Smart Controllers'
        ]
      },
      {
        name: 'Monitoring & Control',
        description: 'Smart monitoring systems for solar installations',
        imageUrl: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=300&fit=crop',
        subcategories: [
          'Monitoring Systems',
          'Smart Switches',
          'Remote Controls'
        ]
      }
    ]

    const createdCategories = {}
    
    // Create main categories and subcategories
    for (const categoryData of categories) {
      const mainCategory = await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.imageUrl
        }
      })
      
      createdCategories[categoryData.name] = mainCategory
      
      // Create subcategories
      for (const subName of categoryData.subcategories) {
        const subCategory = await prisma.category.create({
          data: {
            name: subName,
            description: `High-quality ${subName.toLowerCase()} for solar installations`,
            parentId: mainCategory.id
          }
        })
        createdCategories[subName] = subCategory
      }
    }

    console.log(`✅ Created ${Object.keys(createdCategories).length} categories`)

    // Sample product data
    const productTemplates = [
      // Solar Panels
      {
        title: 'SunPower Maxeon 3 400W Solar Panel',
        description: 'Premium residential solar panel with industry-leading efficiency and 25-year warranty. Features advanced cell technology and robust construction.',
        basePrice: 299.99,
        category: 'Monocrystalline Panels',
        condition: 'NEW',
        specifications: [
          { name: 'Power Output', value: '400', unit: 'W' },
          { name: 'Efficiency', value: '22.8', unit: '%' },
          { name: 'Voltage', value: '54.7', unit: 'V' },
          { name: 'Current', value: '7.31', unit: 'A' },
          { name: 'Dimensions', value: '1690x1046x35', unit: 'mm' },
          { name: 'Weight', value: '18.6', unit: 'kg' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=400&fit=crop'
        ]
      },
      {
        title: 'Canadian Solar 315W Poly Panel - Used',
        description: 'Reliable polycrystalline solar panel in excellent condition. Perfect for budget-conscious solar installations.',
        basePrice: 145.00,
        category: 'Polycrystalline Panels',
        condition: 'GOOD',
        specifications: [
          { name: 'Power Output', value: '315', unit: 'W' },
          { name: 'Efficiency', value: '16.2', unit: '%' },
          { name: 'Voltage', value: '37.0', unit: 'V' },
          { name: 'Current', value: '8.51', unit: 'A' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop'
        ]
      },
      {
        title: 'LG NeON 2 380W Bifacial Panel',
        description: 'Advanced bifacial solar panel that generates power from both sides. Excellent for ground-mount installations.',
        basePrice: 425.99,
        category: 'Bifacial Panels',
        condition: 'NEW',
        specifications: [
          { name: 'Power Output', value: '380', unit: 'W' },
          { name: 'Efficiency', value: '21.4', unit: '%' },
          { name: 'Bifaciality', value: '70', unit: '%' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop'
        ]
      },
      // Inverters
      {
        title: 'SolarEdge SE7600H-US String Inverter',
        description: 'Smart string inverter with built-in power optimizers connectivity and monitoring. Perfect for residential installations.',
        basePrice: 1299.99,
        category: 'String Inverters',
        condition: 'NEW',
        specifications: [
          { name: 'AC Power', value: '7600', unit: 'W' },
          { name: 'Efficiency', value: '97.5', unit: '%' },
          { name: 'Input Voltage', value: '125-1000', unit: 'VDC' },
          { name: 'Output Voltage', value: '240/208', unit: 'VAC' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'
        ]
      },
      {
        title: 'Enphase IQ7+ Microinverter (Set of 10)',
        description: 'High-performance microinverters for maximum energy harvest. Each panel operates independently.',
        basePrice: 899.99,
        category: 'Microinverters',
        condition: 'NEW',
        specifications: [
          { name: 'AC Power', value: '290', unit: 'W' },
          { name: 'Efficiency', value: '97.0', unit: '%' },
          { name: 'Warranty', value: '25', unit: 'years' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'
        ]
      },
      // Batteries
      {
        title: 'Tesla Powerwall 2 - Refurbished',
        description: 'Premium home battery storage system. Refurbished by certified technicians with 2-year warranty.',
        basePrice: 8999.99,
        category: 'Lithium-Ion Batteries',
        condition: 'LIKE_NEW',
        specifications: [
          { name: 'Capacity', value: '13.5', unit: 'kWh' },
          { name: 'Power', value: '5', unit: 'kW' },
          { name: 'Efficiency', value: '90', unit: '%' },
          { name: 'Warranty', value: '2', unit: 'years' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
        ]
      },
      {
        title: 'LiFePO4 48V 100Ah Battery Bank',
        description: 'High-quality lithium iron phosphate battery bank perfect for off-grid solar systems.',
        basePrice: 1899.99,
        category: 'Lithium-Ion Batteries',
        condition: 'NEW',
        specifications: [
          { name: 'Voltage', value: '48', unit: 'V' },
          { name: 'Capacity', value: '100', unit: 'Ah' },
          { name: 'Cycles', value: '6000+', unit: 'cycles' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
        ]
      },
      // Mounting Systems
      {
        title: 'IronRidge XR Rail Mounting System',
        description: 'Professional-grade mounting system for residential roof installations. Includes all hardware.',
        basePrice: 499.99,
        category: 'Roof Mounting',
        condition: 'NEW',
        specifications: [
          { name: 'Material', value: 'Aluminum', unit: '' },
          { name: 'Length', value: '168', unit: 'inches' },
          { name: 'Load Rating', value: '75', unit: 'psf' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop'
        ]
      },
      {
        title: 'SnapNrack Ground Mount Kit - 10 Panel',
        description: 'Complete ground mounting solution for up to 10 solar panels. Easy installation.',
        basePrice: 799.99,
        category: 'Ground Mounting',
        condition: 'NEW',
        specifications: [
          { name: 'Panel Capacity', value: '10', unit: 'panels' },
          { name: 'Tilt Angle', value: '20-60', unit: 'degrees' },
          { name: 'Wind Rating', value: '120', unit: 'mph' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&h=400&fit=crop'
        ]
      },
      // Complete Systems
      {
        title: 'Complete 5kW Solar System Kit',
        description: 'Everything you need for a 5kW solar installation. Includes panels, inverter, mounting, and monitoring.',
        basePrice: 6999.99,
        category: 'Solar Panels',
        condition: 'NEW',
        specifications: [
          { name: 'System Size', value: '5', unit: 'kW' },
          { name: 'Annual Production', value: '7500', unit: 'kWh' },
          { name: 'Panels Included', value: '16', unit: 'panels' },
          { name: 'Warranty', value: '25', unit: 'years' }
        ],
        imageUrls: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'
        ]
      }
    ]

    // Get test user (assuming one exists)
    const testUser = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' }
    })

    if (!testUser) {
      console.log('❌ Test user not found. Please run auth seed first.')
      return
    }

    // Create products (mix of regular and auction items)
    const createdProducts = []
    
    for (let i = 0; i < productTemplates.length; i++) {
      const template = productTemplates[i]
      const isAuction = Math.random() > 0.6 // 40% chance of being auction
      
      // Price variations for different conditions
      const priceMultiplier = {
        'NEW': 1.0,
        'LIKE_NEW': 0.85,
        'GOOD': 0.70,
        'FAIR': 0.55,
        'POOR': 0.40
      }
      
      const finalPrice = Math.round(template.basePrice * priceMultiplier[template.condition] * 100) / 100
      
      const productData = {
        title: template.title,
        description: template.description,
        price: finalPrice,
        condition: template.condition,
        categoryId: createdCategories[template.category]?.id,
        ownerId: testUser.id,
        imageUrls: template.imageUrls,
        status: 'ACTIVE',
        
        // Location data
        street: '123 Solar St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US',
        
        // Auction fields
        isAuction,
        ...(isAuction && {
          auctionEndDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random 1-7 days
          minimumBid: Math.round(finalPrice * 0.7 * 100) / 100,
          currentBid: Math.round(finalPrice * (0.7 + Math.random() * 0.2) * 100) / 100,
          buyNowPrice: Math.random() > 0.5 ? Math.round(finalPrice * 1.2 * 100) / 100 : null
        }),
        
        // Specifications as nested create
        specifications: {
          create: template.specifications || []
        }
      }
      
      const product = await prisma.product.create({
        data: productData
      })
      
      createdProducts.push(product)
      
      // Add some bids for auction items
      if (isAuction && Math.random() > 0.5) {
        const numBids = Math.floor(Math.random() * 5) + 1
        const startingBid = product.minimumBid
        const currentBid = product.currentBid
        const bidIncrement = (currentBid - startingBid) / numBids
        
        for (let j = 0; j < numBids; j++) {
          const bidAmount = Math.round((startingBid + (bidIncrement * (j + 1))) * 100) / 100
          await prisma.bid.create({
            data: {
              amount: bidAmount,
              userId: testUser.id,
              productId: product.id,
              isWinning: j === numBids - 1 // Last bid is winning
            }
          })
        }
      }
    }

    console.log(`✅ Created ${createdProducts.length} products`)
    console.log(`📊 Auctions: ${createdProducts.filter(p => p.isAuction).length}`)
    console.log(`🛒 Buy Now: ${createdProducts.filter(p => !p.isAuction).length}`)
    
    console.log('🎉 Test data creation completed!')
    console.log('\nYou can now test:')
    console.log('- Products page: /products')
    console.log('- Auctions page: /auctions') 
    console.log('- Categories browsing')
    console.log('- Search functionality')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
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