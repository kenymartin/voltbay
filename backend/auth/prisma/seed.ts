import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
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
  await prisma.category.upsert({
    where: { name: 'Monocrystalline Panels' },
    update: {},
    create: {
      name: 'Monocrystalline Panels',
      description: 'High-efficiency single crystal solar panels',
      parentId: solarPanels.id
    }
  })

  await prisma.category.upsert({
    where: { name: 'Polycrystalline Panels' },
    update: {},
    create: {
      name: 'Polycrystalline Panels',
      description: 'Cost-effective multi-crystal solar panels',
      parentId: solarPanels.id
    }
  })

  await prisma.category.upsert({
    where: { name: 'Lithium Batteries' },
    update: {},
    create: {
      name: 'Lithium Batteries',
      description: 'High-performance lithium-ion battery systems',
      parentId: batteries.id
    }
  })

  await prisma.category.upsert({
    where: { name: 'Lead Acid Batteries' },
    update: {},
    create: {
      name: 'Lead Acid Batteries',
      description: 'Traditional lead acid battery systems',
      parentId: batteries.id
    }
  })

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@voltbay.com' },
    update: {},
    create: {
      email: 'admin@voltbay.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL/.LVtpO', // password123
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created categories:', {
    solarPanels: solarPanels.name,
    batteries: batteries.name,
    inverters: inverters.name,
    chargeControllers: chargeControllers.name,
    mountingSystems: mountingSystems.name
  })
  console.log('👤 Admin user created:', adminUser.email)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 