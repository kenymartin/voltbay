import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  console.log('Testing product creation...')
  
  const user = await prisma.user.findFirst()
  const category = await prisma.category.findFirst()
  
  console.log('User found:', user?.email)
  console.log('Category found:', category?.name)
  
  if (user && category) {
    try {
      const product = await prisma.product.create({
        data: {
          title: 'Test Solar Panel',
          description: 'Test description',
          price: 100.00,
          imageUrls: ['https://example.com/image.jpg'],
          status: 'ACTIVE',
          condition: 'NEW',
          categoryId: category.id,
          ownerId: user.id,
          isAuction: false,
          city: 'Test City',
          state: 'Test State',
          country: 'USA'
        }
      })
      console.log('✅ Created product:', product.title)
    } catch (error) {
      console.error('❌ Error creating product:', error)
    }
  } else {
    console.log('❌ Missing user or category')
  }
  
  await prisma.$disconnect()
}

test() 