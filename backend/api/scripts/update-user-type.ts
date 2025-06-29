import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserTypes() {
  try {
    const userToUpdate = await prisma.user.findUnique({
      where: {
        email: 'enterprise-buyer-20@voltbay.com',
      },
    });

    if (userToUpdate) {
      const newEmail = 'enterprise-vendor-20@voltbay.com';
      const newFirstName = userToUpdate.firstName?.replace('Enterprise Buyer', 'Enterprise Vendor');
      const newLastName = userToUpdate.lastName?.replace('Enterprise Buyer', 'Enterprise Vendor');

      // Ensure the new email is unique
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (!existingUser) {
        await prisma.user.update({
          where: { id: userToUpdate.id },
          data: { email: newEmail, firstName: newFirstName, lastName: newLastName },
        });
        console.log(`Updated user ${userToUpdate.email} to ${newEmail}`);
      } else {
        console.log(`Email ${newEmail} already exists. No update performed.`);
      }
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserTypes(); 