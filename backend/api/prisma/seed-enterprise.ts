import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEnterpriseData() {
  console.log('🌱 Seeding enterprise data...')

  try {
    // Create enterprise vendor users
    const vendor1 = await prisma.user.upsert({
      where: { email: 'terrasmart@example.com' },
      update: {},
      create: {
        email: 'terrasmart@example.com',
        password: '$2a$10$rHmVWN/Hf3CnR3oFJw.aIuCK3YgwCxY/1WzKvPwIZKQpTNvXJZ6QK', // password123
        firstName: 'Terra',
        lastName: 'Smart',
        role: 'ENTERPRISE_VENDOR',
        verified: true,
        city: 'San Francisco',
        state: 'CA',
        country: 'United States'
      }
    })

    const vendor2 = await prisma.user.upsert({
      where: { email: 'sunpower@example.com' },
      update: {},
      create: {
        email: 'sunpower@example.com',
        password: '$2a$10$rHmVWN/Hf3CnR3oFJw.aIuCK3YgwCxY/1WzKvPwIZKQpTNvXJZ6QK', // password123
        firstName: 'Sun',
        lastName: 'Power',
        role: 'ENTERPRISE_VENDOR',
        verified: true,
        city: 'San Jose',
        state: 'CA',
        country: 'United States'
      }
    })

    // Get existing categories - use more generic approach
    const categories = await prisma.category.findMany()
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })))
    
    // Use the first available category as fallback, or find specific ones
    const rackingCategory = categories.find(c => 
      c.name.toLowerCase().includes('racking') || 
      c.name.toLowerCase().includes('mounting') ||
      c.name.toLowerCase().includes('hardware')
    ) || categories[0]

    const panelsCategory = categories.find(c => 
      c.name.toLowerCase().includes('panel') || 
      c.name.toLowerCase().includes('module')
    ) || categories[1] || categories[0]

    const invertersCategory = categories.find(c => 
      c.name.toLowerCase().includes('inverter') || 
      c.name.toLowerCase().includes('power')
    ) || categories[2] || categories[0]

    // Create enterprise listings
    const listings = [
      {
        name: 'TerraMount Commercial Racking System',
        description: 'High-performance ground-mount racking system for commercial solar installations. Engineered for durability and optimized for fast installation.',
        categoryId: rackingCategory.id,
        vendorId: vendor1.id,
        specs: {
          capacity: '1MW - 100MW',
          material: 'Galvanized Steel',
          windLoad: '150 mph',
          snowLoad: '50 psf',
          tiltAngle: '15-35 degrees',
          panelCompatibility: 'All standard panels',
          warranty: '25 years structural, 10 years coating'
        },
        location: 'San Francisco, CA',
        deliveryTime: '4-6 weeks',
        basePrice: 0.45,
        priceUnit: 'per watt',
        imageUrls: [
          'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop'
        ],
        documentUrls: [
          'https://example.com/terramount-spec-sheet.pdf',
          'https://example.com/terramount-installation-guide.pdf'
        ],
        status: 'ACTIVE' as const
      },
      {
        name: 'SunPower Maxeon Commercial Panels',
        description: 'Premium commercial solar panels with industry-leading efficiency and 40-year warranty. Perfect for large-scale installations.',
        categoryId: panelsCategory.id,
        vendorId: vendor2.id,
        specs: {
          power: '400W - 450W',
          efficiency: '22.8%',
          technology: 'Maxeon Gen 6',
          dimensions: '2067 x 1046 x 40 mm',
          weight: '22.5 kg',
          warranty: '40 years product, 40 years power',
          temperature: '-40°C to +85°C',
          certification: 'IEC 61215, IEC 61730, UL 1703'
        },
        location: 'San Jose, CA',
        deliveryTime: '2-4 weeks',
        basePrice: 0.85,
        priceUnit: 'per watt',
        imageUrls: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&h=600&fit=crop'
        ],
        documentUrls: [
          'https://example.com/sunpower-maxeon-datasheet.pdf',
          'https://example.com/sunpower-installation-manual.pdf'
        ],
        status: 'ACTIVE' as const
      },
      {
        name: 'TerraInvert Utility-Scale String Inverters',
        description: 'High-efficiency string inverters designed for utility-scale solar projects. Advanced monitoring and grid-tie capabilities.',
        categoryId: invertersCategory.id,
        vendorId: vendor1.id,
        specs: {
          power: '100kW - 250kW',
          efficiency: '98.5%',
          dcVoltage: '1000V',
          acVoltage: '480V 3-phase',
          protection: 'IP65',
          monitoring: 'Built-in WiFi/Ethernet',
          warranty: '10 years standard, 20 years extended',
          certifications: 'UL 1741, IEEE 1547'
        },
        location: 'San Francisco, CA',
        deliveryTime: '6-8 weeks',
        basePrice: 0.12,
        priceUnit: 'per watt',
        imageUrls: [
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
        ],
        documentUrls: [
          'https://example.com/terrainvert-datasheet.pdf'
        ],
        status: 'ACTIVE' as const
      }
    ]

    // Create enterprise listings
    for (const listing of listings) {
      await prisma.enterpriseListing.upsert({
        where: { 
          // Use a combination of name and vendor to ensure uniqueness
          id: `${listing.name.toLowerCase().replace(/\s+/g, '-')}-${listing.vendorId}`
        },
        update: listing,
        create: {
          id: `${listing.name.toLowerCase().replace(/\s+/g, '-')}-${listing.vendorId}`,
          ...listing
        }
      })
    }

    console.log('✅ Enterprise data seeded successfully')
    console.log(`📊 Created ${listings.length} enterprise listings`)
    console.log(`👥 Created 2 enterprise vendor accounts`)

  } catch (error) {
    console.error('❌ Error seeding enterprise data:', error)
    throw error
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedEnterpriseData()
    .then(() => {
      console.log('🎉 Enterprise seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Enterprise seeding failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedEnterpriseData } 