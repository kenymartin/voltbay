import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedExtendedEnterpriseData() {
  console.log('🌱 Seeding extended enterprise data with 30+ vendors...')

  try {
    // Get existing categories
    const categories = await prisma.category.findMany()
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })))
    
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

    // Extended vendor data
    const vendors = [
      // Solar Panel Manufacturers
      { email: 'jinko@solar.com', firstName: 'Jinko', lastName: 'Solar', city: 'Shanghai', state: 'Shanghai', country: 'China' },
      { email: 'trina@solar.com', firstName: 'Trina', lastName: 'Solar', city: 'Changzhou', state: 'Jiangsu', country: 'China' },
      { email: 'canadian@solar.com', firstName: 'Canadian', lastName: 'Solar', city: 'Guelph', state: 'ON', country: 'Canada' },
      { email: 'firstsolar@energy.com', firstName: 'First', lastName: 'Solar', city: 'Tempe', state: 'AZ', country: 'United States' },
      { email: 'longi@solar.com', firstName: 'LONGi', lastName: 'Solar', city: 'Xian', state: 'Shaanxi', country: 'China' },
      { email: 'hanwha@qcells.com', firstName: 'Hanwha', lastName: 'Q-Cells', city: 'Seoul', state: 'Seoul', country: 'South Korea' },
      { email: 'ja@solar.com', firstName: 'JA', lastName: 'Solar', city: 'Beijing', state: 'Beijing', country: 'China' },
      { email: 'risen@energy.com', firstName: 'Risen', lastName: 'Energy', city: 'Ningbo', state: 'Zhejiang', country: 'China' },
      
      // Inverter Manufacturers
      { email: 'sma@solar.com', firstName: 'SMA', lastName: 'Solar', city: 'Niestetal', state: 'Hesse', country: 'Germany' },
      { email: 'fronius@intl.com', firstName: 'Fronius', lastName: 'International', city: 'Pettenbach', state: 'Upper Austria', country: 'Austria' },
      { email: 'solaredge@tech.com', firstName: 'SolarEdge', lastName: 'Technologies', city: 'Herzliya', state: 'Tel Aviv', country: 'Israel' },
      { email: 'enphase@energy.com', firstName: 'Enphase', lastName: 'Energy', city: 'Fremont', state: 'CA', country: 'United States' },
      { email: 'huawei@solar.com', firstName: 'Huawei', lastName: 'Solar', city: 'Shenzhen', state: 'Guangdong', country: 'China' },
      { email: 'abb@solar.com', firstName: 'ABB', lastName: 'Solar', city: 'Zurich', state: 'Zurich', country: 'Switzerland' },
      { email: 'delta@energy.com', firstName: 'Delta', lastName: 'Energy', city: 'Taipei', state: 'Taipei', country: 'Taiwan' },
      
      // Racking & Mounting Systems
      { email: 'schletter@group.com', firstName: 'Schletter', lastName: 'Group', city: 'Haag', state: 'Bavaria', country: 'Germany' },
      { email: 'unirac@solar.com', firstName: 'Unirac', lastName: 'Solar', city: 'Albuquerque', state: 'NM', country: 'United States' },
      { email: 'ironridge@solar.com', firstName: 'IronRidge', lastName: 'Solar', city: 'Hayward', state: 'CA', country: 'United States' },
      { email: 'mounting@systems.com', firstName: 'Mounting', lastName: 'Systems', city: 'Ranningen', state: 'Lower Saxony', country: 'Germany' },
      { email: 'clenergy@mount.com', firstName: 'Clenergy', lastName: 'Mounting', city: 'Xiamen', state: 'Fujian', country: 'China' },
      { email: 'gamechange@solar.com', firstName: 'GameChange', lastName: 'Solar', city: 'New York', state: 'NY', country: 'United States' },
      { email: 'nextracker@inc.com', firstName: 'Nextracker', lastName: 'Inc', city: 'Fremont', state: 'CA', country: 'United States' },
      
      // Battery & Energy Storage
      { email: 'tesla@energy.com', firstName: 'Tesla', lastName: 'Energy', city: 'Austin', state: 'TX', country: 'United States' },
      { email: 'lg@energy.com', firstName: 'LG', lastName: 'Energy', city: 'Seoul', state: 'Seoul', country: 'South Korea' },
      { email: 'byd@energy.com', firstName: 'BYD', lastName: 'Energy', city: 'Shenzhen', state: 'Guangdong', country: 'China' },
      { email: 'fluence@energy.com', firstName: 'Fluence', lastName: 'Energy', city: 'Arlington', state: 'VA', country: 'United States' },
      { email: 'sonnen@battery.com', firstName: 'Sonnen', lastName: 'Battery', city: 'Munich', state: 'Bavaria', country: 'Germany' },
      
      // Monitoring & Software
      { email: 'solar@analytics.com', firstName: 'Solar', lastName: 'Analytics', city: 'Sydney', state: 'NSW', country: 'Australia' },
      { email: 'locus@energy.com', firstName: 'Locus', lastName: 'Energy', city: 'Hoboken', state: 'NJ', country: 'United States' },
      { email: 'power@factors.com', firstName: 'Power', lastName: 'Factors', city: 'San Francisco', state: 'CA', country: 'United States' },
      
      // Installation & EPC
      { email: 'solarmax@tech.com', firstName: 'SolarMax', lastName: 'Technology', city: 'Denver', state: 'CO', country: 'United States' },
      { email: 'sunrun@install.com', firstName: 'Sunrun', lastName: 'Installation', city: 'San Francisco', state: 'CA', country: 'United States' },
      { email: 'sungevity@solar.com', firstName: 'Sungevity', lastName: 'Solar', city: 'Oakland', state: 'CA', country: 'United States' },
      { email: 'trinity@solar.com', firstName: 'Trinity', lastName: 'Solar', city: 'Wall', state: 'NJ', country: 'United States' },
      { email: 'solar@city.com', firstName: 'Solar', lastName: 'City', city: 'Buffalo', state: 'NY', country: 'United States' }
    ]

    // Create vendor users
    const createdVendors = []
    for (const vendor of vendors) {
      const createdVendor = await prisma.user.upsert({
        where: { email: vendor.email },
        update: {},
        create: {
          email: vendor.email,
          password: '$2a$10$rHmVWN/Hf3CnR3oFJw.aIuCK3YgwCxY/1WzKvPwIZKQpTNvXJZ6QK', // password123
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          role: 'ENTERPRISE_VENDOR',
          verified: true,
          city: vendor.city,
          state: vendor.state,
          country: vendor.country,
          isEnterpriseVendor: true,
          companyName: `${vendor.firstName} ${vendor.lastName}`,
          locationCity: vendor.city,
          locationState: vendor.state
        }
      })
      createdVendors.push(createdVendor)
    }

    // Create vendor projects (completed jobs history)
    const vendorProjects = []
    for (const vendor of createdVendors) {
      const numProjects = Math.floor(Math.random() * 15) + 5 // 5-20 projects per vendor
      for (let i = 0; i < numProjects; i++) {
        vendorProjects.push({
          vendorId: vendor.id,
          title: `Solar Installation Project ${i + 1}`,
          description: `Completed ${Math.floor(Math.random() * 500) + 50}kW solar installation`,
          status: 'completed',
          projectType: (['ROOFTOP', 'GROUND', 'COMMERCIAL', 'UTILITY_SCALE'] as const)[Math.floor(Math.random() * 4)] as any,
          systemSizeKw: Math.floor(Math.random() * 1000) + 100,
          location: `${vendor.city}, ${vendor.state}`,
          completedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
        })
      }
    }

    // Insert vendor projects
    for (const project of vendorProjects) {
      await prisma.vendorProject.create({
        data: project
      })
    }

    console.log('✅ Extended enterprise data seeded successfully')
    console.log(`👥 Created ${createdVendors.length} enterprise vendor accounts`)
    console.log(`🏗️ Created ${vendorProjects.length} vendor project records`)

  } catch (error) {
    console.error('❌ Error seeding extended enterprise data:', error)
    throw error
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedExtendedEnterpriseData()
    .then(() => {
      console.log('🎉 Extended enterprise seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Extended enterprise seeding failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedExtendedEnterpriseData } 