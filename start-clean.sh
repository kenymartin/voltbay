#!/bin/bash

echo "🧹 Cleaning up existing processes..."

# Kill any existing development servers
pkill -f 'nodemon' 2>/dev/null || true
pkill -f 'vite' 2>/dev/null || true
pkill -f 'node.*3000' 2>/dev/null || true
pkill -f 'node.*4000' 2>/dev/null || true
pkill -f 'node.*5001' 2>/dev/null || true

echo "⏳ Waiting for processes to terminate..."
sleep 3

echo "🔍 Checking port availability..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

echo "⏳ Final cleanup wait..."
sleep 2

echo "🚀 Starting VoltBay development servers..."
cd /Users/kenymartin/Documents/voltbay
npm run dev 