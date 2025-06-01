import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  console.log('Checking products in database...')
  
  const products = await prisma.product.findMany()
  console.log('Products found:', products.length)
  
  if (products.length > 0) {
    console.log('Product titles:', products.map(p => p.title))
  }
  
  await prisma.$disconnect()
}

check() 