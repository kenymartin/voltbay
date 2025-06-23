import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { restoreDatabase } from './restore-database'

const prisma = new PrismaClient()

async function resetSchemaAndRestore() {
  try {
    console.log('🚀 Starting database schema reset and restoration process...')

    // Find the most recent backup file
    const backupDir = path.join(__dirname, '../backups')
    if (!fs.existsSync(backupDir)) {
      throw new Error('❌ No backup directory found. Please run backup first!')
    }

    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.json'))
      .sort()
      .reverse()

    if (backupFiles.length === 0) {
      throw new Error('❌ No backup files found. Please run backup first!')
    }

    const latestBackup = path.join(backupDir, backupFiles[0])
    console.log(`📁 Using backup file: ${latestBackup}`)

    // Step 1: Reset the database schema
    console.log('\n🔄 Step 1: Resetting database schema...')
    console.log('   ⚠️  This will drop all tables and recreate them from schema.prisma')
    
    try {
      // Reset the database (drops all tables and recreates from schema)
      execSync('npx prisma migrate reset --force', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('   ✅ Database schema reset completed')
    } catch (error) {
      console.error('   ❌ Error resetting database schema:', error)
      throw error
    }

    // Step 2: Generate Prisma client
    console.log('\n🔄 Step 2: Generating Prisma client...')
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('   ✅ Prisma client generated')
    } catch (error) {
      console.error('   ❌ Error generating Prisma client:', error)
      throw error
    }

    // Step 3: Restore data from backup
    console.log('\n🔄 Step 3: Restoring data from backup...')
    await restoreDatabase(latestBackup)

    console.log('\n🎉 Database schema reset and restoration completed successfully!')
    console.log('\n📋 What was accomplished:')
    console.log('   ✅ Database schema was reset to match schema.prisma')
    console.log('   ✅ All TypeScript compilation issues should be resolved')
    console.log('   ✅ All data was restored from the backup')
    console.log('   ✅ Services should now start without errors')

    console.log('\n🚀 Next steps:')
    console.log('   1. Test the auth service: cd ../auth && npm run dev')
    console.log('   2. Test the API service: npm run dev')
    console.log('   3. Test the frontend: cd ../../frontend && npm run dev')

  } catch (error) {
    console.error('💥 Error during reset and restore process:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  resetSchemaAndRestore()
    .then(() => {
      console.log('\n🎉 Process completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Process failed:', error)
      process.exit(1)
    })
}

export { resetSchemaAndRestore } 