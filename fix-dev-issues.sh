#!/bin/bash

echo "🔧 Fixing VoltBay development issues..."

# Navigate to project root
cd /Users/kenymartin/Documents/voltbay

echo "📦 Installing root dependencies..."
npm install

echo "🧹 Clearing Vite cache..."
rm -rf frontend/node_modules/.vite

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🚀 Starting development servers..."
cd ..
npm run dev 