# VoltBay Admin Testing Credentials ✅

## Admin User (VERIFIED WORKING)
- **Email**: admin@voltbay.com  
- **Password**: password123
- **Role**: ADMIN
- **Status**: ✅ Login tested and working

## Additional Test Users (VERIFIED WORKING)
All test users use the same password: **password123**

- john.doe@email.com (USER) ✅
- jane.smith@email.com (USER) ✅ 
- mike.wilson@email.com (USER) ✅
- sarah.johnson@email.com (USER) ✅

## Database Seeding
To re-seed the database with fresh test data including the admin user:

```bash
cd backend/api
node seed-database.js
```

This will:
- Clear existing data
- Create the admin user with proper role permissions
- Create 4 test users  
- Create 6 solar industry categories
- Create 12 realistic solar products (7 regular products + 5 auctions)
- Generate realistic auction bids

## Login Instructions
1. Navigate to the VoltBay frontend (usually http://localhost:3001, 3002, or 3003)
2. Click "Login" 
3. Use the admin credentials above
4. You'll have access to admin features and the admin dashboard

## API Testing
You can also test login directly via API:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@voltbay.com", "password": "password123"}'
```

## Features Available to Admin
The admin user has full permissions to:
- Manage users, products, categories
- View all system data and analytics  
- Access admin dashboard
- Moderate content and auctions
- View all orders and transactions

---
**Status**: ✅ All credentials verified and working as of latest seeding.
**Password Policy**: All test accounts use `password123` for convenience. 