#!/bin/bash

# 🔍 VoltBay Backup Verification Script

echo "🔍 Verifying VoltBay Recovery Point..."
echo "====================================="

# Check if backup files exist
echo "📁 Checking backup files..."
if [ -f "database_backup.sql" ]; then
    BACKUP_SIZE=$(wc -c < database_backup.sql)
    echo "✅ Database backup: ${BACKUP_SIZE} bytes"
else
    echo "❌ Database backup: MISSING"
    exit 1
fi

# Check backup content
echo "📊 Analyzing backup content..."
USERS_COUNT=$(grep -c "INSERT INTO public.users" database_backup.sql || echo "0")
PRODUCTS_COUNT=$(grep -c "INSERT INTO public.products" database_backup.sql || echo "0")
CATEGORIES_COUNT=$(grep -c "INSERT INTO public.categories" database_backup.sql || echo "0")

echo "   Users in backup: ${USERS_COUNT}"
echo "   Products in backup: ${PRODUCTS_COUNT}"
echo "   Categories in backup: ${CATEGORIES_COUNT}"

# Check for critical data
if grep -q "admin@voltbay.io" database_backup.sql; then
    echo "✅ Admin account found in backup"
else
    echo "❌ Admin account missing from backup"
fi

if grep -q "Tesla Powerwall" database_backup.sql; then
    echo "✅ Sample products found in backup"
else
    echo "❌ Sample products missing from backup"
fi

# Check GitHub commit
echo "📂 Checking GitHub status..."
CURRENT_COMMIT=$(git rev-parse HEAD)
if [ "$CURRENT_COMMIT" = "f93ce51" ] || git show "$CURRENT_COMMIT" | grep -q "Complete authentication and database seeding"; then
    echo "✅ Correct commit: $CURRENT_COMMIT"
else
    echo "⚠️  Different commit: $CURRENT_COMMIT"
fi

# Check required files
echo "📋 Checking project structure..."
REQUIRED_FILES=(
    "../backend/api/prisma/schema.prisma"
    "../backend/auth/prisma/schema.prisma"
    "../frontend/package.json"
    "../docker-compose.yml"
    "restore_system.sh"
    "stop_services.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done

echo ""
echo "🛡️ Recovery Point Summary:"
echo "========================="
echo "📅 Created: June 1, 2025"
echo "🏷️  Commit: f93ce51"
echo "📊 Database: ${USERS_COUNT} users, ${PRODUCTS_COUNT} products"
echo "💾 Backup Size: ${BACKUP_SIZE} bytes"
echo ""
echo "🚀 To restore system: ./restore_system.sh"
echo "🛑 To stop services: ./stop_services.sh" 