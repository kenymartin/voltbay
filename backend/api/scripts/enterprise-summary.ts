import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function displayEnterpriseSummary() {
  console.log('\n🏢 VOLTBAY ENTERPRISE SYSTEM SUMMARY')
  console.log('=====================================\n')

  // Get enterprise buyers
  const enterpriseBuyers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      isEnterprise: true
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      city: true,
      state: true,
      verified: true,
      createdAt: true
    }
  })

  // Get enterprise vendors
  const enterpriseVendors = await prisma.user.findMany({
    where: {
      role: 'VENDOR',
      isEnterprise: true
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      city: true,
      state: true,
      verified: true,
      createdAt: true
    }
  })

  // Get enterprise listings
  const enterpriseListings = await prisma.enterpriseListing.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      vendor: {
        select: {
          companyName: true,
          email: true
        }
      },
      category: {
        select: {
          name: true
        }
      }
    }
  })

  // Get quote requests
  const quoteRequests = await prisma.quoteRequest.findMany({
    include: {
      buyer: {
        select: {
          companyName: true,
          email: true
        }
      },
      listing: {
        select: {
          name: true
        }
      }
    }
  })

  // Display Enterprise Buyers
  console.log('👥 ENTERPRISE BUYERS (Companies purchasing solar equipment/services)')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  
  if (enterpriseBuyers.length === 0) {
    console.log('   No enterprise buyers found.\n')
  } else {
    enterpriseBuyers.forEach((buyer, index) => {
      console.log(`${index + 1}. ${buyer.companyName}`)
      console.log(`   Contact: ${buyer.firstName} ${buyer.lastName}`)
      console.log(`   Email: ${buyer.email}`)
      console.log(`   Location: ${buyer.city}, ${buyer.state}`)
      console.log(`   Status: ${buyer.verified ? '✅ Verified' : '⚠️  Pending Verification'}`)
      console.log(`   Created: ${buyer.createdAt.toLocaleDateString()}`)
      console.log('')
    })
  }

  // Display Enterprise Vendors
  console.log('🏭 ENTERPRISE VENDORS (Solar companies serving business clients)')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  
  if (enterpriseVendors.length === 0) {
    console.log('   No enterprise vendors found.\n')
  } else {
    enterpriseVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.companyName}`)
      console.log(`   Contact: ${vendor.firstName} ${vendor.lastName}`)
      console.log(`   Email: ${vendor.email}`)
      console.log(`   Location: ${vendor.city}, ${vendor.state}`)
      console.log(`   Status: ${vendor.verified ? '✅ Verified' : '⚠️  Pending Verification'}`)
      console.log(`   Created: ${vendor.createdAt.toLocaleDateString()}`)
      console.log('')
    })
  }

  // Display Enterprise Listings
  console.log('📋 ENTERPRISE LISTINGS (Services offered by vendors)')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  
  if (enterpriseListings.length === 0) {
    console.log('   No enterprise listings found.\n')
  } else {
    enterpriseListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.name}`)
      console.log(`   Vendor: ${listing.vendor.companyName}`)
      console.log(`   Category: ${listing.category.name}`)
      console.log(`   Location: ${listing.location}`)
      console.log(`   Price: $${listing.basePrice} ${listing.priceUnit}`)
      console.log(`   Delivery: ${listing.deliveryTime}`)
      console.log(`   Quote Only: ${listing.quoteOnly ? 'Yes' : 'No'}`)
      console.log('')
    })
  }

  // Display Quote Requests
  console.log('💬 QUOTE REQUESTS (Active business inquiries)')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  
  if (quoteRequests.length === 0) {
    console.log('   No quote requests found.\n')
  } else {
    quoteRequests.forEach((request, index) => {
      console.log(`${index + 1}. Quote Request #${request.id.slice(-8)}`)
      console.log(`   Buyer: ${request.buyer.companyName}`)
      console.log(`   Service: ${request.listing?.name || 'General Quote Request'}`)
      console.log(`   Quantity: ${request.requestedQuantity}`)
      console.log(`   Budget: $${request.budget?.toLocaleString() || 'Not specified'}`)
      console.log(`   Status: ${request.status}`)
      console.log(`   Created: ${request.createdAt.toLocaleDateString()}`)
      console.log('')
    })
  }

  // Display Summary Statistics
  console.log('📊 SYSTEM STATISTICS')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  console.log(`   Enterprise Buyers: ${enterpriseBuyers.length}`)
  console.log(`   Enterprise Vendors: ${enterpriseVendors.length}`)
  console.log(`   Active Listings: ${enterpriseListings.length}`)
  console.log(`   Quote Requests: ${quoteRequests.length}`)
  console.log(`   Total Enterprise Users: ${enterpriseBuyers.length + enterpriseVendors.length}`)

  // Display Login Information
  console.log('\n🔐 LOGIN INFORMATION')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  console.log('   Default Password: password123')
  console.log('   All accounts are verified and ready to use')
  console.log('')
  
  console.log('   🏢 BUYER LOGIN EXAMPLES:')
  if (enterpriseBuyers.length > 0) {
    enterpriseBuyers.slice(0, 3).forEach(buyer => {
      console.log(`   • ${buyer.email} (${buyer.companyName})`)
    })
  }
  
  console.log('\n   🏭 VENDOR LOGIN EXAMPLES:')
  if (enterpriseVendors.length > 0) {
    enterpriseVendors.slice(0, 3).forEach(vendor => {
      console.log(`   • ${vendor.email} (${vendor.companyName})`)
    })
  }

  console.log('\n🚀 TESTING SUGGESTIONS')
  console.log('═══════════════════════════════════════════════════════════════════\n')
  console.log('   1. Login as an enterprise buyer and browse vendor listings')
  console.log('   2. Use the ROI Calculator to estimate solar project costs')
  console.log('   3. Request quotes from vendors for specific services')
  console.log('   4. Login as an enterprise vendor and view quote requests')
  console.log('   5. Test the messaging system between buyers and vendors')
  console.log('   6. Upload documents and attachments to quote requests')
  console.log('   7. Test role-based UI filtering (enterprise vs regular users)')
  console.log('')
}

async function main() {
  try {
    await displayEnterpriseSummary()
  } catch (error) {
    console.error('❌ Error displaying enterprise summary:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { displayEnterpriseSummary } 