import { PrismaClient, EnterpriseListingStatus, ProjectType, MountingType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEnterpriseListings() {
  console.log('🏢 Seeding enterprise listings...')

  // Get enterprise vendors
  const vendors = await prisma.user.findMany({
    where: {
      role: 'VENDOR',
      isEnterprise: true
    }
  })

  if (vendors.length === 0) {
    throw new Error('No enterprise vendors found. Please run the enterprise user seed first.')
  }

  // Get a category for listings
  const category = await prisma.category.findFirst({
    where: { name: 'Solar Panels' }
  })

  if (!category) {
    throw new Error('Solar Panels category not found. Please run the main seed first.')
  }

  // Enterprise listings for each vendor
  const listings = [
    // SolarPro Enterprise Solutions
    {
      vendorEmail: 'sales@solarpro-enterprise.com',
      name: 'Commercial Solar Installation - Turnkey Solutions',
      description: 'Complete commercial solar installation services for businesses of all sizes. From 100kW to 5MW+ systems. We handle design, permitting, installation, and commissioning. Specialized in rooftop and ground-mount systems with proven track record of 500+ successful commercial installations.',
      location: 'San Diego, CA',
      deliveryTime: '4-8 months',
      basePrice: 1650,
      priceUnit: 'per kW',
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND', 'COMMERCIAL'],
        serviceArea: ['CA', 'AZ', 'NV', 'UT'],
        minimumProjectSize: 100,
        maximumProjectSize: 5000,
        features: [
          'Complete turnkey installation',
          'Engineering and design services',
          'Permitting and utility interconnection',
          '25-year performance warranty',
          'O&M services available',
          'NABCEP certified installers',
          'Real-time monitoring system',
          'Financing options available'
        ],
        certifications: ['NABCEP', 'OSHA 30', 'UL Listed Equipment', 'CSLB Licensed'],
        yearsOfExperience: 15
      }
    },
    // SunPower Industrial
    {
      vendorEmail: 'commercial@sunpower-industrial.com',
      name: 'Tier 1 Solar Panels - Commercial Grade',
      description: 'Premium Tier 1 solar panels specifically designed for commercial and industrial applications. High-efficiency monocrystalline modules with superior performance in high-temperature environments. Bulk pricing available for projects 500kW+.',
      location: 'Tampa, FL',
      deliveryTime: '2-6 weeks',
      basePrice: 580,
      priceUnit: 'per kW',
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND', 'COMMERCIAL'],
        serviceArea: ['FL', 'GA', 'AL', 'SC', 'NC'],
        minimumProjectSize: 50,
        maximumProjectSize: 10000,
        features: [
          'Tier 1 solar panels',
          'High efficiency (22%+)',
          'Extended 30-year warranty',
          'Bulk quantity discounts',
          'Technical support included',
          'Fast delivery nationwide',
          'Weather-resistant design',
          'Anti-reflective coating'
        ],
        certifications: ['IEC 61215', 'IEC 61730', 'UL 1703', 'ISO 9001'],
        yearsOfExperience: 12
      }
    },
    // Renewable Energy Systems
    {
      vendorEmail: 'enterprise@renewable-systems.com',
      name: 'Solar Energy Storage Systems - Commercial',
      description: 'Advanced battery energy storage systems for commercial solar installations. Lithium-ion battery systems with intelligent energy management. Perfect for demand charge reduction, backup power, and grid services.',
      location: 'Portland, OR',
      deliveryTime: '6-10 weeks',
      basePrice: 1200,
      priceUnit: 'per kWh',
      specs: {
        projectTypes: ['COMMERCIAL', 'INDUSTRIAL'],
        serviceArea: ['OR', 'WA', 'ID', 'CA', 'NV'],
        minimumProjectSize: 100,
        maximumProjectSize: 2000,
        features: [
          'Lithium-ion battery technology',
          'Intelligent energy management',
          'Grid-tie and backup capabilities',
          'Remote monitoring and control',
          '15-year warranty',
          'UL listed components',
          'Demand charge optimization',
          'Peak shaving capabilities'
        ],
        certifications: ['UL 9540', 'UL 1973', 'IEEE 1547', 'NFPA 855 Compliant'],
        yearsOfExperience: 10
      }
    },
    // MegaWatt Commercial Solutions
    {
      vendorEmail: 'commercial@megawatt-solutions.com',
      name: 'Large-Scale Solar EPC Services',
      description: 'Engineering, Procurement, and Construction (EPC) services for utility-scale and large commercial solar projects. Specializing in projects 1MW to 100MW+. Full-service from development to commissioning.',
      location: 'Las Vegas, NV',
      deliveryTime: '8-18 months',
      basePrice: 1450,
      priceUnit: 'per kW',
      specs: {
        projectTypes: ['GROUND', 'UTILITY'],
        serviceArea: ['NV', 'CA', 'AZ', 'UT', 'CO'],
        minimumProjectSize: 1000,
        maximumProjectSize: 100000,
        features: [
          'Utility-scale expertise',
          'Complete EPC services',
          'Project development support',
          'Grid interconnection management',
          'Performance guarantees',
          'Construction management',
          'Commissioning services',
          'Long-term O&M contracts'
        ],
        certifications: ['NABCEP', 'PE Licensed Engineers', 'OSHA 30', 'Utility Approved'],
        yearsOfExperience: 18
      }
    },
    // Solar Innovations LLC
    {
      vendorEmail: 'business@solar-innovations.com',
      name: 'Solar Racking & Mounting Systems',
      description: 'Heavy-duty racking and mounting systems for commercial and industrial solar installations. Engineered for high wind and snow loads. Compatible with all major panel manufacturers. Pre-engineered solutions available.',
      location: 'Raleigh, NC',
      deliveryTime: '3-8 weeks',
      basePrice: 380,
      priceUnit: 'per kW',
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND', 'CARPORT'],
        serviceArea: ['NC', 'SC', 'VA', 'TN', 'GA'],
        minimumProjectSize: 25,
        maximumProjectSize: 5000,
        features: [
          'High wind/snow load ratings',
          'Pre-assembled components',
          'Structural engineering included',
          'Corrosion-resistant materials',
          'Installation training provided',
          'Competitive bulk pricing',
          'Fast shipping nationwide',
          'Technical support included'
        ],
        certifications: ['UL 2703', 'Structural Engineering Certification', 'ASCE 7'],
        yearsOfExperience: 14
      }
    },
    // Photovoltaic Professionals
    {
      vendorEmail: 'enterprise@photovoltaic-pros.com',
      name: 'Solar O&M Services - Commercial',
      description: 'Comprehensive Operations & Maintenance services for commercial solar installations. Preventive maintenance, performance monitoring, and emergency repairs. Maximize your solar investment with professional O&M.',
      location: 'Houston, TX',
      deliveryTime: '2-4 weeks',
      basePrice: 25,
      priceUnit: 'per kW/year',
      specs: {
        projectTypes: ['ROOFTOP', 'GROUND', 'COMMERCIAL'],
        serviceArea: ['TX', 'OK', 'LA', 'AR', 'NM'],
        minimumProjectSize: 50,
        maximumProjectSize: 10000,
        features: [
          'Preventive maintenance programs',
          '24/7 performance monitoring',
          'Emergency repair services',
          'Inverter and panel cleaning',
          'Performance reporting',
          'Warranty claim management',
          'Vegetation management',
          'Insurance claim support'
        ],
        certifications: ['NABCEP', 'OSHA 30', 'Bonded and Insured', 'NECA Member'],
        yearsOfExperience: 11
      }
    }
  ]

  // Create listings
  console.log('Creating enterprise listings...')
  for (const listingData of listings) {
    try {
      const vendor = vendors.find(v => v.email === listingData.vendorEmail)
      if (!vendor) {
        console.log(`⚠️  Vendor not found: ${listingData.vendorEmail}`)
        continue
      }

      const existingListing = await prisma.enterpriseListing.findFirst({
        where: {
          vendorId: vendor.id,
          name: listingData.name
        }
      })

      if (!existingListing) {
        await prisma.enterpriseListing.create({
          data: {
            name: listingData.name,
            description: listingData.description,
            categoryId: category.id,
            vendorId: vendor.id,
            location: listingData.location,
            deliveryTime: listingData.deliveryTime,
            basePrice: listingData.basePrice,
            priceUnit: listingData.priceUnit,
            status: EnterpriseListingStatus.ACTIVE,
            quoteOnly: true,
            specs: listingData.specs,
            imageUrls: [],
            documentUrls: []
          }
        })
        console.log(`✅ Created listing: ${listingData.name} for ${vendor.companyName}`)
      } else {
        console.log(`⚠️  Listing already exists: ${listingData.name}`)
      }
    } catch (error) {
      console.error(`❌ Error creating listing ${listingData.name}:`, error)
    }
  }

  // Display summary
  const totalListings = await prisma.enterpriseListing.count({
    where: {
      status: EnterpriseListingStatus.ACTIVE
    }
  })

  console.log('\n📊 Enterprise Listings Summary:')
  console.log(`   Active Enterprise Listings: ${totalListings}`)

  // Show listings by vendor
  const listingsByVendor = await prisma.enterpriseListing.findMany({
    where: {
      status: EnterpriseListingStatus.ACTIVE
    },
    include: {
      vendor: {
        select: {
          companyName: true,
          email: true
        }
      }
    }
  })

  console.log('\n📋 Enterprise Listings by Vendor:')
  listingsByVendor.forEach(listing => {
    console.log(`   • ${listing.name} - ${listing.vendor.companyName}`)
    console.log(`     Price: $${listing.basePrice} ${listing.priceUnit}`)
    console.log(`     Location: ${listing.location}`)
    console.log(`     Delivery: ${listing.deliveryTime}`)
    console.log('')
  })
}

async function main() {
  try {
    await seedEnterpriseListings()
    console.log('\n🎉 Enterprise listings seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during enterprise listings seeding:', error)
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

export { seedEnterpriseListings } 