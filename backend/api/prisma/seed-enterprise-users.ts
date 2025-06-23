import { PrismaClient, UserRole, EnterpriseListingStatus, ProjectType, MountingType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedEnterpriseUsers() {
  console.log('🌱 Seeding enterprise users...')

  // Enterprise Buyers (Companies that purchase solar equipment/services)
  const enterpriseBuyers = [
    {
      email: 'procurement@greentech-corp.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Sarah',
      lastName: 'Chen',
      role: UserRole.BUYER,
      isEnterprise: true,
      verified: true,
      companyName: 'GreenTech Corporation',
      phone: '+1-555-0101',
      street: '1500 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    {
      email: 'energy@manufacturing-plus.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Michael',
      lastName: 'Rodriguez',
      role: UserRole.BUYER,
      isEnterprise: true,
      verified: true,
      companyName: 'Manufacturing Plus LLC',
      phone: '+1-555-0102',
      street: '2800 Industrial Blvd',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    },
    {
      email: 'sustainability@retail-chain.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jennifer',
      lastName: 'Thompson',
      role: UserRole.BUYER,
      isEnterprise: true,
      verified: true,
      companyName: 'Retail Chain Solutions',
      phone: '+1-555-0103',
      street: '4200 Commerce Way',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA'
    },
    {
      email: 'facilities@healthcare-systems.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'David',
      lastName: 'Park',
      role: UserRole.BUYER,
      isEnterprise: true,
      verified: true,
      companyName: 'Healthcare Systems Inc',
      phone: '+1-555-0104',
      street: '3500 Medical Center Dr',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    {
      email: 'procurement@logistics-global.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Amanda',
      lastName: 'Williams',
      role: UserRole.BUYER,
      isEnterprise: true,
      verified: true,
      companyName: 'Global Logistics Corp',
      phone: '+1-555-0105',
      street: '1800 Warehouse District',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'USA'
    }
  ]

  // Enterprise Vendors (Solar companies/installers serving business clients)
  const enterpriseVendors = [
    {
      email: 'sales@solarpro-enterprise.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Robert',
      lastName: 'Johnson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'SolarPro Enterprise Solutions',
      phone: '+1-555-0201',
      street: '900 Solar Technology Pkwy',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'USA'
    },
    {
      email: 'commercial@sunpower-industrial.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Lisa',
      lastName: 'Martinez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'SunPower Industrial',
      phone: '+1-555-0202',
      street: '1200 Energy Solutions Way',
      city: 'Tampa',
      state: 'FL',
      zipCode: '33602',
      country: 'USA'
    },
    {
      email: 'enterprise@renewable-systems.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'James',
      lastName: 'Davis',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Renewable Energy Systems',
      phone: '+1-555-0203',
      street: '2400 Clean Energy Blvd',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA'
    },
    {
      email: 'commercial@megawatt-solutions.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Emily',
      lastName: 'Brown',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'MegaWatt Commercial Solutions',
      phone: '+1-555-0204',
      street: '3100 Industrial Solar Dr',
      city: 'Las Vegas',
      state: 'NV',
      zipCode: '89101',
      country: 'USA'
    },
    {
      email: 'business@solar-innovations.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Kevin',
      lastName: 'Wilson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Solar Innovations LLC',
      phone: '+1-555-0205',
      street: '1600 Innovation Center',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      country: 'USA'
    },
    {
      email: 'enterprise@photovoltaic-pros.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Maria',
      lastName: 'Garcia',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Photovoltaic Professionals',
      phone: '+1-555-0206',
      street: '2700 Solar Farm Rd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    // Adding 40 more vendors
    {
      email: 'info@suntech-commercial.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Daniel',
      lastName: 'Thompson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'SunTech Commercial Systems',
      phone: '+1-555-0207',
      street: '4500 Technology Dr',
      city: 'Austin',
      state: 'TX',
      zipCode: '73344',
      country: 'USA'
    },
    {
      email: 'sales@green-energy-corp.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Sarah',
      lastName: 'Anderson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Green Energy Corporation',
      phone: '+1-555-0208',
      street: '1800 Renewable Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85003',
      country: 'USA'
    },
    {
      email: 'contact@solar-dynamics.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Michael',
      lastName: 'Chen',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Solar Dynamics Inc',
      phone: '+1-555-0209',
      street: '2200 Innovation Blvd',
      city: 'Denver',
      state: 'CO',
      zipCode: '80205',
      country: 'USA'
    },
    {
      email: 'enterprise@brightfuture-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jennifer',
      lastName: 'White',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Bright Future Solar',
      phone: '+1-555-0210',
      street: '3300 Solar Valley Rd',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      country: 'USA'
    },
    {
      email: 'business@quantum-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'David',
      lastName: 'Miller',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Quantum Solar Solutions',
      phone: '+1-555-0211',
      street: '1700 Tech Park Dr',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      country: 'USA'
    },
    {
      email: 'sales@apex-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Amanda',
      lastName: 'Taylor',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Apex Energy Systems',
      phone: '+1-555-0212',
      street: '2900 Industrial Pkwy',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37203',
      country: 'USA'
    },
    {
      email: 'info@powermax-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Christopher',
      lastName: 'Lee',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'PowerMax Solar Enterprise',
      phone: '+1-555-0213',
      street: '4100 Energy Center',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    {
      email: 'commercial@solaredge-pro.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jessica',
      lastName: 'Rodriguez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'SolarEdge Professional',
      phone: '+1-555-0214',
      street: '1500 Commerce St',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA'
    },
    {
      email: 'enterprise@sunbeam-systems.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Ryan',
      lastName: 'Johnson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Sunbeam Systems LLC',
      phone: '+1-555-0215',
      street: '3600 Solar Ridge',
      city: 'Salt Lake City',
      state: 'UT',
      zipCode: '84101',
      country: 'USA'
    },
    {
      email: 'sales@voltaic-ventures.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Nicole',
      lastName: 'Brown',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Voltaic Ventures',
      phone: '+1-555-0216',
      street: '2500 Green Tech Way',
      city: 'Kansas City',
      state: 'MO',
      zipCode: '64108',
      country: 'USA'
    },
    {
      email: 'contact@solaris-commercial.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Brandon',
      lastName: 'Davis',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Solaris Commercial Group',
      phone: '+1-555-0217',
      street: '1900 Business Park Dr',
      city: 'Indianapolis',
      state: 'IN',
      zipCode: '46204',
      country: 'USA'
    },
    {
      email: 'business@helios-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Michelle',
      lastName: 'Wilson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Helios Energy Solutions',
      phone: '+1-555-0218',
      street: '4200 Solar Plaza',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43215',
      country: 'USA'
    },
    {
      email: 'enterprise@radiant-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Kevin',
      lastName: 'Martinez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Radiant Power Corp',
      phone: '+1-555-0219',
      street: '3700 Energy Blvd',
      city: 'Oklahoma City',
      state: 'OK',
      zipCode: '73102',
      country: 'USA'
    },
    {
      email: 'sales@luminous-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Stephanie',
      lastName: 'Garcia',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Luminous Solar Technologies',
      phone: '+1-555-0220',
      street: '2800 Tech Center Dr',
      city: 'Louisville',
      state: 'KY',
      zipCode: '40202',
      country: 'USA'
    },
    {
      email: 'info@zenith-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Matthew',
      lastName: 'Anderson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Zenith Solar Systems',
      phone: '+1-555-0221',
      street: '1400 Innovation Way',
      city: 'Memphis',
      state: 'TN',
      zipCode: '38103',
      country: 'USA'
    },
    {
      email: 'commercial@eclipse-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Lauren',
      lastName: 'Thompson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Eclipse Energy Group',
      phone: '+1-555-0222',
      street: '3200 Solar Park Ave',
      city: 'Richmond',
      state: 'VA',
      zipCode: '23230',
      country: 'USA'
    },
    {
      email: 'enterprise@stellar-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jonathan',
      lastName: 'White',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Stellar Solar Solutions',
      phone: '+1-555-0223',
      street: '2100 Green Energy Dr',
      city: 'Milwaukee',
      state: 'WI',
      zipCode: '53202',
      country: 'USA'
    },
    {
      email: 'sales@prism-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Samantha',
      lastName: 'Lee',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Prism Power Systems',
      phone: '+1-555-0224',
      street: '4800 Renewable Rd',
      city: 'Albuquerque',
      state: 'NM',
      zipCode: '87102',
      country: 'USA'
    },
    {
      email: 'contact@nexus-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Andrew',
      lastName: 'Miller',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Nexus Solar Enterprise',
      phone: '+1-555-0225',
      street: '1300 Technology Blvd',
      city: 'Tucson',
      state: 'AZ',
      zipCode: '85701',
      country: 'USA'
    },
    {
      email: 'business@aurora-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Rachel',
      lastName: 'Taylor',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Aurora Energy Systems',
      phone: '+1-555-0226',
      street: '3900 Solar Tech Pkwy',
      city: 'Fresno',
      state: 'CA',
      zipCode: '93721',
      country: 'USA'
    },
    {
      email: 'enterprise@spectrum-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Tyler',
      lastName: 'Rodriguez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Spectrum Solar Corp',
      phone: '+1-555-0227',
      street: '2600 Energy Solutions Way',
      city: 'Mesa',
      state: 'AZ',
      zipCode: '85201',
      country: 'USA'
    },
    {
      email: 'sales@vertex-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Megan',
      lastName: 'Davis',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Vertex Power Solutions',
      phone: '+1-555-0228',
      street: '4600 Industrial Center',
      city: 'Virginia Beach',
      state: 'VA',
      zipCode: '23451',
      country: 'USA'
    },
    {
      email: 'info@pinnacle-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Gregory',
      lastName: 'Wilson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Pinnacle Solar Technologies',
      phone: '+1-555-0229',
      street: '1800 Clean Tech Dr',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'USA'
    },
    {
      email: 'commercial@fusion-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Brittany',
      lastName: 'Martinez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Fusion Energy Group',
      phone: '+1-555-0230',
      street: '3400 Renewable Energy Blvd',
      city: 'Colorado Springs',
      state: 'CO',
      zipCode: '80903',
      country: 'USA'
    },
    {
      email: 'enterprise@titan-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Nathan',
      lastName: 'Brown',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Titan Solar Systems',
      phone: '+1-555-0231',
      street: '2300 Solar Innovation Way',
      city: 'Omaha',
      state: 'NE',
      zipCode: '68102',
      country: 'USA'
    },
    {
      email: 'sales@catalyst-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Kimberly',
      lastName: 'Johnson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Catalyst Power Solutions',
      phone: '+1-555-0232',
      street: '4700 Energy Park Dr',
      city: 'Reno',
      state: 'NV',
      zipCode: '89501',
      country: 'USA'
    },
    {
      email: 'contact@meridian-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Justin',
      lastName: 'Garcia',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Meridian Solar Enterprise',
      phone: '+1-555-0233',
      street: '1600 Green Technology Ave',
      city: 'Boise',
      state: 'ID',
      zipCode: '83702',
      country: 'USA'
    },
    {
      email: 'business@velocity-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Courtney',
      lastName: 'Anderson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Velocity Energy Systems',
      phone: '+1-555-0234',
      street: '3800 Solar Development Rd',
      city: 'Spokane',
      state: 'WA',
      zipCode: '99201',
      country: 'USA'
    },
    {
      email: 'enterprise@horizon-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Marcus',
      lastName: 'Thompson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Horizon Solar Group',
      phone: '+1-555-0235',
      street: '2700 Renewable Solutions Dr',
      city: 'Little Rock',
      state: 'AR',
      zipCode: '72201',
      country: 'USA'
    },
    {
      email: 'sales@matrix-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Vanessa',
      lastName: 'White',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Matrix Power Corporation',
      phone: '+1-555-0236',
      street: '4300 Tech Valley Blvd',
      city: 'Jackson',
      state: 'MS',
      zipCode: '39201',
      country: 'USA'
    },
    {
      email: 'info@optimum-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Eric',
      lastName: 'Lee',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Optimum Solar Solutions',
      phone: '+1-555-0237',
      street: '1700 Energy Innovation Dr',
      city: 'Des Moines',
      state: 'IA',
      zipCode: '50309',
      country: 'USA'
    },
    {
      email: 'commercial@genesis-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Heather',
      lastName: 'Miller',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Genesis Energy Systems',
      phone: '+1-555-0238',
      street: '3500 Solar Technology Center',
      city: 'Wichita',
      state: 'KS',
      zipCode: '67202',
      country: 'USA'
    },
    {
      email: 'enterprise@summit-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Derek',
      lastName: 'Taylor',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Summit Solar Technologies',
      phone: '+1-555-0239',
      street: '2400 Clean Energy Plaza',
      city: 'Topeka',
      state: 'KS',
      zipCode: '66603',
      country: 'USA'
    },
    {
      email: 'sales@infinity-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Allison',
      lastName: 'Rodriguez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Infinity Power Solutions',
      phone: '+1-555-0240',
      street: '4900 Renewable Tech Way',
      city: 'Lincoln',
      state: 'NE',
      zipCode: '68508',
      country: 'USA'
    },
    {
      email: 'contact@precision-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Cameron',
      lastName: 'Davis',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Precision Solar Group',
      phone: '+1-555-0241',
      street: '1900 Solar Engineering Dr',
      city: 'Fargo',
      state: 'ND',
      zipCode: '58102',
      country: 'USA'
    },
    {
      email: 'business@paramount-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Alexis',
      lastName: 'Wilson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Paramount Energy Systems',
      phone: '+1-555-0242',
      street: '3600 Green Power Blvd',
      city: 'Sioux Falls',
      state: 'SD',
      zipCode: '57104',
      country: 'USA'
    },
    {
      email: 'enterprise@evolution-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jordan',
      lastName: 'Martinez',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Evolution Solar Corp',
      phone: '+1-555-0243',
      street: '2800 Innovation District',
      city: 'Billings',
      state: 'MT',
      zipCode: '59101',
      country: 'USA'
    },
    {
      email: 'sales@dynamo-power.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Taylor',
      lastName: 'Brown',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Dynamo Power Technologies',
      phone: '+1-555-0244',
      street: '4400 Energy Development Way',
      city: 'Casper',
      state: 'WY',
      zipCode: '82601',
      country: 'USA'
    },
    {
      email: 'info@pioneer-solar.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Morgan',
      lastName: 'Johnson',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Pioneer Solar Solutions',
      phone: '+1-555-0245',
      street: '1500 Sustainable Energy Dr',
      city: 'Helena',
      state: 'MT',
      zipCode: '59601',
      country: 'USA'
    },
    {
      email: 'commercial@vanguard-energy.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Blake',
      lastName: 'Garcia',
      role: UserRole.VENDOR,
      isEnterprise: true,
      verified: true,
      companyName: 'Vanguard Energy Group',
      phone: '+1-555-0246',
      street: '3700 Solar Future Pkwy',
      city: 'Cheyenne',
      state: 'WY',
      zipCode: '82001',
      country: 'USA'
    }
  ]

  // Create enterprise buyers
  console.log('Creating enterprise buyers...')
  for (const buyer of enterpriseBuyers) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: buyer.email }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: buyer
        })
        console.log(`✅ Created enterprise buyer: ${buyer.companyName} (${buyer.email})`)
      } else {
        console.log(`⚠️  Enterprise buyer already exists: ${buyer.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating buyer ${buyer.email}:`, error)
    }
  }

  // Create enterprise vendors
  console.log('Creating enterprise vendors...')
  for (const vendor of enterpriseVendors) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: vendor.email }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: vendor
        })
        console.log(`✅ Created enterprise vendor: ${vendor.companyName} (${vendor.email})`)
      } else {
        console.log(`⚠️  Enterprise vendor already exists: ${vendor.email}`)
      }
    } catch (error) {
      console.error(`❌ Error creating vendor ${vendor.email}:`, error)
    }
  }

  // Display summary
  const totalBuyers = await prisma.user.count({
    where: {
      role: UserRole.BUYER,
      isEnterprise: true
    }
  })

  const totalVendors = await prisma.user.count({
    where: {
      role: UserRole.VENDOR,
      isEnterprise: true
    }
  })

  console.log('\n📊 Enterprise Users Summary:')
  console.log(`   Enterprise Buyers: ${totalBuyers}`)
  console.log(`   Enterprise Vendors: ${totalVendors}`)
  console.log(`   Total Enterprise Users: ${totalBuyers + totalVendors}`)

  console.log('\n🔐 Default Login Credentials:')
  console.log('   Password for all accounts: password123')
  console.log('\n📧 Enterprise Buyer Emails:')
  enterpriseBuyers.forEach(buyer => {
    console.log(`   • ${buyer.email} (${buyer.companyName})`)
  })
  console.log('\n📧 Enterprise Vendor Emails:')
  enterpriseVendors.forEach(vendor => {
    console.log(`   • ${vendor.email} (${vendor.companyName})`)
  })
}

async function main() {
  try {
    await seedEnterpriseUsers()
    console.log('\n🎉 Enterprise user seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during enterprise user seeding:', error)
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

export { seedEnterpriseUsers } 