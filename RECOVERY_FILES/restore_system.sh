#!/bin/bash

# 🛡️ VoltBay System Restoration Script
# Recovery Point: f93ce51 - Fully Functional System
# Created: June 1, 2025

echo "🚀 Starting VoltBay System Restoration..."
echo "Recovery Point: f93ce51 (Fully Functional System)"
echo "=============================================="

# Step 1: Stop any running services
echo "🛑 Stopping existing services..."
pkill -f "npm run dev" 2>/dev/null || true
docker stop voltbay-postgres 2>/dev/null || true
docker rm voltbay-postgres 2>/dev/null || true

# Step 2: Start PostgreSQL
echo "🗄️ Starting PostgreSQL database..."
docker run -d --name voltbay-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=voltbay \
  -p 5432:5432 \
  postgres:15

echo "⏳ Waiting for PostgreSQL to start..."
sleep 15

# Step 3: Restore database from backup
echo "📥 Restoring database from backup..."
docker exec -i voltbay-postgres psql -U postgres -d voltbay < database_backup.sql

# Step 4: Setup environment files
echo "⚙️ Setting up environment configuration..."
echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/voltbay" > ../backend/api/.env
echo "VITE_API_URL=http://localhost:5001" > ../.env
echo "VITE_AUTH_URL=http://localhost:4000" >> ../.env

# Step 5: Install dependencies (if needed)
echo "📦 Installing dependencies..."
cd ../backend/api && npm install --silent
cd ../auth && npm install --silent
cd ../../frontend && npm install --silent
cd ../RECOVERY_FILES

# Step 6: Start services
echo "🚀 Starting all services..."

# Start API service in background
cd ../backend/api
nohup npm run dev > ../../RECOVERY_FILES/api.log 2>&1 &
API_PID=$!
echo "API Service PID: $API_PID"

# Start Auth service in background
cd ../auth
nohup npm run dev > ../../RECOVERY_FILES/auth.log 2>&1 &
AUTH_PID=$!
echo "Auth Service PID: $AUTH_PID"

# Start Frontend service in background
cd ../../frontend
nohup npm run dev > ../RECOVERY_FILES/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend Service PID: $FRONTEND_PID"

cd ../RECOVERY_FILES

# Step 7: Save PIDs for cleanup
echo $API_PID > api.pid
echo $AUTH_PID > auth.pid
echo $FRONTEND_PID > frontend.pid

echo "⏳ Waiting for services to start..."
sleep 10

# Step 8: Verify services
echo "🔍 Verifying services..."

# Check API
if curl -s http://localhost:5001/health | grep -q "healthy"; then
    echo "✅ API Service: Running (http://localhost:5001)"
else
    echo "❌ API Service: Failed"
fi

# Check Auth
if curl -s http://localhost:4000/health | grep -q "healthy"; then
    echo "✅ Auth Service: Running (http://localhost:4000)"
else
    echo "❌ Auth Service: Failed"
fi

# Check Frontend
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend: Running (http://localhost:3001)"
else
    echo "❌ Frontend: Failed"
fi

# Step 9: Test authentication
echo "🔐 Testing authentication..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@voltbay.io","password":"Password123"}')

if echo "$LOGIN_RESULT" | grep -q "Login successful"; then
    echo "✅ Authentication: Working"
    echo "🔑 Test with: admin@voltbay.io / Password123"
else
    echo "❌ Authentication: Failed"
    echo "Debug: $LOGIN_RESULT"
fi

echo ""
echo "🎉 VoltBay System Restoration Complete!"
echo "=============================================="
echo "📱 Frontend: http://localhost:3001"
echo "🔧 API: http://localhost:5001"
echo "🔐 Auth: http://localhost:4000"
echo ""
echo "🔑 Test Accounts:"
echo "   Admin: admin@voltbay.io / Password123"
echo "   User:  testuser@voltbay.com / Password123"
echo ""
echo "📊 Database: 18 products, 4 users, auction data"
echo "📝 Logs: Check *.log files in RECOVERY_FILES/"
echo ""
echo "To stop services: ./stop_services.sh" 