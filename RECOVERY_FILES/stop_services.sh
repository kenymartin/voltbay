#!/bin/bash

# 🛑 VoltBay Services Stop Script

echo "🛑 Stopping VoltBay Services..."
echo "================================"

# Stop services using saved PIDs
if [ -f "api.pid" ]; then
    API_PID=$(cat api.pid)
    echo "Stopping API Service (PID: $API_PID)..."
    kill $API_PID 2>/dev/null || true
    rm api.pid
fi

if [ -f "auth.pid" ]; then
    AUTH_PID=$(cat auth.pid)
    echo "Stopping Auth Service (PID: $AUTH_PID)..."
    kill $AUTH_PID 2>/dev/null || true
    rm auth.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "Stopping Frontend Service (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm frontend.pid
fi

# Kill any remaining node processes
echo "Stopping any remaining Node.js processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

# Stop Docker containers
echo "Stopping PostgreSQL container..."
docker stop voltbay-postgres 2>/dev/null || true

echo "✅ All services stopped."
echo ""
echo "To restart: ./restore_system.sh" 