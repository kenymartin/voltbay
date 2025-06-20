import companyService from '../src/services/companyService'

async function createSampleCompany() {
  console.log('🏢 Creating sample solar company...')

  try {
    const result = await companyService.createCompany({
      name: 'SolarTech Solutions',
      description: 'Leading provider of residential and commercial solar installations',
      website: 'https://solartech-solutions.com',
      email: 'info@solartech-solutions.com',
      phone: '+1-555-SOLAR-01',
      street: '123 Solar Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      adminEmail: 'admin@solartech-solutions.com',
      adminFirstName: 'Sarah',
      adminLastName: 'Johnson',
      adminPassword: 'SecureAdmin123!'
    })

    console.log('✅ Company created successfully!')
    console.log('📊 Company Details:')
    console.log(`   ID: ${result.company.id}`)
    console.log(`   Name: ${result.company.name}`)
    console.log(`   Email: ${result.company.email}`)
    console.log('')
    console.log('👤 Admin User Details:')
    console.log(`   ID: ${result.admin.id}`)
    console.log(`   Email: ${result.admin.email}`)
    console.log(`   Name: ${result.admin.firstName} ${result.admin.lastName}`)
    console.log(`   Role: ${result.admin.role}`)
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log(`   Email: admin@solartech-solutions.com`)
    console.log(`   Password: SecureAdmin123!`)

  } catch (error) {
    console.error('❌ Failed to create company:', error)
    throw error
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createSampleCompany()
    .then(() => {
      console.log('🎉 Sample company setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}

export default createSampleCompany 