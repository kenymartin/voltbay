const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Update Enterprise Vendor
    const enterpriseVendor = await prisma.user.update({
      where: { email: 'enterprise-vendor@example.com' },
      data: { verified: true }
    });
    console.log('✅ Enterprise Vendor approved:', enterpriseVendor.email);

    // Update Enterprise Buyer  
    const enterpriseBuyer = await prisma.user.update({
      where: { email: 'enterprise-buyer@example.com' },
      data: { verified: true }
    });
    console.log('✅ Enterprise Buyer approved:', enterpriseBuyer.email);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().finally(() => prisma.$disconnect());
