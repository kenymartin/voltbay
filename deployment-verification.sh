#!/bin/bash

echo "🚀 VoltBay Deployment Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_text=$3
    
    echo -n "Checking $service_name... "
    
    response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null)
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ] && [[ "$body" == *"$expected_text"* ]]; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP: $http_code)"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking Database... "
    cd backend/api
    result=$(node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count().then(count => console.log(count)).catch(() => console.log('ERROR')).finally(() => prisma.\$disconnect())" 2>/dev/null)
    cd ../..
    
    if [[ "$result" =~ ^[0-9]+$ ]] && [ "$result" -gt 0 ]; then
        echo -e "${GREEN}✅ CONNECTED${NC} ($result users)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check build status
check_builds() {
    echo -n "Checking Frontend Build... "
    if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
        echo -e "${GREEN}✅ BUILT${NC}"
        build_status=0
    else
        echo -e "${RED}❌ NOT BUILT${NC}"
        build_status=1
    fi
    
    echo -n "Checking Shared Package... "
    if [ -d "shared/dist" ]; then
        echo -e "${GREEN}✅ BUILT${NC}"
        ((build_status+=0))
    else
        echo -e "${RED}❌ NOT BUILT${NC}"
        ((build_status+=1))
    fi
    
    return $build_status
}

# Main verification
echo "🔍 Service Health Checks"
echo "------------------------"

services_healthy=0

check_service "Frontend" "http://localhost:3000" "VoltBay" && ((services_healthy++))
check_service "Auth Service" "http://localhost:4000/health" "Auth service is healthy" && ((services_healthy++))
check_service "API Service" "http://localhost:5001/health" "API service is healthy" && ((services_healthy++))

echo ""
echo "🗄️  Database Check"
echo "------------------"
check_database && ((services_healthy++))

echo ""
echo "🏗️  Build Status"
echo "----------------"
check_builds && ((services_healthy++))

echo ""
echo "📊 Summary"
echo "----------"

if [ $services_healthy -eq 5 ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL${NC}"
    echo -e "${GREEN}✅ Frontend: Running${NC}"
    echo -e "${GREEN}✅ Auth Service: Running${NC}"
    echo -e "${GREEN}✅ API Service: Running${NC}"
    echo -e "${GREEN}✅ Database: Connected${NC}"
    echo -e "${GREEN}✅ Builds: Complete${NC}"
    echo ""
    echo -e "${BLUE}🌐 Application URLs:${NC}"
    echo "   Frontend:    http://localhost:3000"
    echo "   Auth API:    http://localhost:4000"
    echo "   Main API:    http://localhost:5001"
    echo ""
    echo -e "${GREEN}🚀 VoltBay is READY FOR DEPLOYMENT!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  ISSUES DETECTED${NC}"
    echo "   Services healthy: $services_healthy/5"
    echo ""
    echo -e "${YELLOW}Please check the failed services above.${NC}"
    exit 1
fi 