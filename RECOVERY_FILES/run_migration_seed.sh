#!/bin/bash

# 🌱 VoltBay Migration Seed Runner
# Safe fake data seeding after database migrations

echo "🌱 VoltBay Migration Seed Runner"
echo "===============================  "

# Function to check if PostgreSQL is running
check_postgres() {
    if docker ps | grep -q voltbay-postgres; then
        echo "✅ PostgreSQL container is running"
        return 0
    else
        echo "❌ PostgreSQL container is not running"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    if docker exec voltbay-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database is accepting connections"
        return 0
    else
        echo "❌ Database is not accepting connections"
        return 1
    fi
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! check_postgres; then
    echo "🚀 Starting PostgreSQL container..."
    docker run -d --name voltbay-postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=voltbay \
        -p 5432:5432 \
        postgres:15
    
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 15
fi

if ! check_database; then
    echo "❌ Failed to connect to database. Exiting."
    exit 1
fi

# Determine API service location
API_DIR=""
if [ -d "../backend/api" ]; then
    API_DIR="../backend/api"
elif [ -d "backend/api" ]; then
    API_DIR="backend/api"
elif [ -d "./api" ]; then
    API_DIR="./api"
else
    echo "❌ Could not find API service directory"
    exit 1
fi

echo "📁 Found API service at: $API_DIR"

# Copy migration seed script to API directory
echo "📋 Setting up migration seed script..."
cp migration_seed.ts "$API_DIR/migration_seed.ts"

# Navigate to API directory
cd "$API_DIR"

# Check if environment file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/voltbay" > .env
fi

# Run the migration seed
echo "🌱 Running migration seed..."
echo "===============================  "

if command -v npx &> /dev/null; then
    npx tsx migration_seed.ts
    SEED_EXIT_CODE=$?
else
    echo "❌ npx/tsx not found. Installing tsx..."
    npm install -g tsx
    npx tsx migration_seed.ts
    SEED_EXIT_CODE=$?
fi

# Clean up
rm -f migration_seed.ts

# Check results
if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "🎉 Migration Seeding Complete!"
    echo "============================="
    echo "📊 Test your system:"
    echo "   Frontend: http://localhost:3001"
    echo "   API:      http://localhost:5001/api/products"
    echo ""
    echo "🔑 Test Accounts:"
    echo "   Admin: admin@voltbay.io / Password123"
    echo "   User:  testuser@voltbay.com / Password123"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Start your services if not running"
    echo "   2. Visit the frontend to verify data"
    echo "   3. Try logging in with test accounts"
else
    echo ""
    echo "❌ Migration Seeding Failed!"
    echo "Check the error messages above for details."
    exit 1
fi 