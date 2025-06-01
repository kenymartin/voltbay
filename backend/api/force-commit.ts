import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function forceCommit() {
  console.log('Checking database state...')
  
  // Force a transaction to ensure everything is committed
  await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany()
    console.log('Products in transaction:', products.length)
    
    if (products.length > 0) {
      console.log('Sample product:', products[0].title)
    }
  })
  
  // Check outside transaction
  const products = await prisma.product.findMany()
  console.log('Products outside transaction:', products.length)
  
  await prisma.$disconnect()
}

forceCommit() 