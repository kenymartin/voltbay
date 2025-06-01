# 🌱 VoltBay Migration Seeding Guide

This guide explains how to use the migration-safe fake data seeding scripts after running database migrations.

## 📋 Overview

When you run database migrations (like `npx prisma migrate dev` or `npx prisma db push`), your database schema gets updated but all existing data is typically preserved. However, if you need to reset your database or want to ensure you have consistent test data, these scripts will help you recreate a complete fake dataset.

## 🎯 Available Scripts

### 1. Basic Migration Seed (`migration_seed.ts`)
- **Purpose**: Creates essential fake data for testing
- **Data Created**:
  - 4 verified users (admin, test user, 2 sellers)
  - 9 categories with hierarchical structure
  - 5 core products with detailed specifications
  - 2 auction items with sample bids
- **Use Case**: Quick setup after migrations

### 2. Extended Migration Seed (`extended_migration_seed.ts`)
- **Purpose**: Creates comprehensive fake data for stress testing
- **Data Created**:
  - 8 users (including unverified accounts)
  - 10 detailed categories
  - 8+ products with realistic pricing
  - Multiple auction items with competitive bidding
  - Random price generation for variety
- **Use Case**: Full testing environment setup

### 3. Migration Seed Runner (`run_migration_seed.sh`)
- **Purpose**: Automated script runner with environment checks
- **Features**:
  - Checks PostgreSQL container status
  - Auto-starts database if needed
  - Finds API service directory automatically
  - Sets up environment variables
  - Runs seeding with error handling
  - Cleanup and verification

## 🚀 Quick Start

### Option 1: Basic Seeding (Recommended)
```bash
cd RECOVERY_FILES
./run_migration_seed.sh
```

### Option 2: Extended Seeding (More Data)
```bash
cd RECOVERY_FILES
# Copy extended seed to API directory
cp extended_migration_seed.ts ../backend/api/
cd ../backend/api
npx tsx extended_migration_seed.ts
```

### Option 3: Manual Seeding
```bash
cd backend/api
# Copy the seed script
cp ../../RECOVERY_FILES/migration_seed.ts .
# Run it
npx tsx migration_seed.ts
# Clean up
rm migration_seed.ts
```

## 🔧 Prerequisites

1. **PostgreSQL Running**: Database container must be running
2. **Environment Setup**: `.env` file with `DATABASE_URL`
3. **Dependencies**: `tsx` package for TypeScript execution
4. **Prisma**: Schema must be up-to-date with migrations

## 📊 What Gets Created

### Users (All password: `Password123`)
- `admin@voltbay.io` - Admin account (verified)
- `testuser@voltbay.com` - Test user (verified)
- `seller1@voltbay.com` - John Seller (verified)
- `seller2@voltbay.com` - Sarah Green (verified)
- Additional users in extended version

### Categories
- **Solar Panels** (with subcategories)
  - Monocrystalline Panels
  - Polycrystalline Panels
  - Thin Film Panels (extended only)
- **Batteries** (with subcategories)
  - Lithium Batteries
  - Lead Acid Batteries
- **Inverters**
- **Charge Controllers**
- **Mounting Systems**

### Products
- High-efficiency solar panels (400W, 365W, 450W)
- Tesla Powerwall 2 battery system
- Pure sine wave inverters
- MPPT charge controllers
- Flexible solar panels (extended only)
- Microinverters (extended only)

### Auction Data
- 2+ active auctions with realistic end dates
- Multiple bids per auction
- Competitive bidding scenarios
- Buy-now pricing options

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep voltbay-postgres

# Start PostgreSQL if needed
docker run -d --name voltbay-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=voltbay \
  -p 5432:5432 \
  postgres:15
```

### Missing Dependencies
```bash
# Install tsx globally
npm install -g tsx

# Or install locally in API directory
cd backend/api
npm install tsx
```

### Environment Variables
```bash
# Create .env file in API directory
echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/voltbay" > backend/api/.env
```

### Schema Issues
```bash
# Reset and apply migrations
cd backend/api
npx prisma migrate reset
npx prisma migrate dev
```

## 🔄 When to Use

### After Database Migrations
```bash
# After running migrations
npx prisma migrate dev
# Run seeding
./RECOVERY_FILES/run_migration_seed.sh
```

### After Schema Changes
```bash
# After updating schema.prisma
npx prisma db push
# Reseed data
./RECOVERY_FILES/run_migration_seed.sh
```

### For Testing
```bash
# Before running tests
./RECOVERY_FILES/run_migration_seed.sh
# Run your tests
npm test
```

## 🎯 Best Practices

1. **Always backup** before running migrations
2. **Use basic seed** for quick testing
3. **Use extended seed** for comprehensive testing
4. **Verify data** after seeding with API calls
5. **Clean up** temporary files after seeding

## 📝 Verification

After seeding, verify your data:

```bash
# Check API endpoints
curl http://localhost:5001/api/products
curl http://localhost:5001/api/categories
curl http://localhost:5001/api/users

# Check frontend
open http://localhost:3001

# Test login
# Email: admin@voltbay.io
# Password: Password123
```

## 🔗 Related Files

- `migration_seed.ts` - Basic seeding script
- `extended_migration_seed.ts` - Extended seeding script
- `run_migration_seed.sh` - Automated runner
- `database_backup.sql` - Full database backup
- `restore_system.sh` - Complete system restoration

## 💡 Tips

- Run seeding after every major migration
- Use extended seeding for UI/UX testing
- Keep test credentials consistent
- Monitor database size with extended seeding
- Consider creating custom seed variants for specific testing scenarios

---

**Need Help?** Check the main `README.md` or recovery documentation for additional troubleshooting steps. 