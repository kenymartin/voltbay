# Database Backup & Restore Guide

## Overview

This guide covers the database backup and restoration process for VoltBay. We've created comprehensive scripts to safely backup all data before schema changes and restore it afterward.

## 🚨 Current Situation

The VoltBay application has critical TypeScript compilation errors due to database schema mismatches:

- **Auth Service**: Missing `isEnterpriseVendor` and `companyName` fields
- **API Service**: Missing `messageType`, `context`, `attachments`, `readAt` fields in Message model
- **API Service**: Missing `Conversation` and `ConversationParticipant` models
- **Enterprise Controller**: `listingId: null` type errors

## 📦 Backup Completed

✅ **Backup Status**: COMPLETED  
📁 **Backup File**: `/Users/kenymartin/Documents/voltbay/backend/api/backups/database-backup-2025-06-20T21-07-04-438Z.json`

### Backup Summary:
- **Users**: 53 (including admin accounts and enterprise vendors)
- **Categories**: 8 (solar equipment categories)
- **Products**: 24 (solar panels, inverters, etc.)
- **Product Specifications**: 112 (detailed product specs)
- **Bids**: 16 (auction bids)
- **Orders**: 4 (completed orders)
- **Enterprise Listings**: 9 (enterprise vendor services)
- **Quote Requests**: 10 (customer quote requests)
- **ROI Simulations**: 6 (ROI calculations)
- **Vendor Projects**: 434 (vendor project portfolio)
- **Payments**: 4 (payment records)
- **Notifications**: 4 (system notifications)
- **Refresh Tokens**: 8 (auth tokens)

## 🛠️ Available Scripts

### 1. Backup Database
```bash
cd backend/api
npm run backup-db
```
Creates a timestamped backup of all database tables.

### 2. Restore Database
```bash
cd backend/api
npm run restore-db <backup-file-path>
```
Restores data from a specific backup file.

### 3. Complete Reset & Restore (Recommended)
```bash
cd backend/api
npm run reset-and-restore
```
This script will:
1. ⚠️  **Reset the database schema** (drops all tables)
2. 🔄 **Recreate tables** from `schema.prisma`
3. 🔧 **Generate new Prisma client**
4. 📦 **Restore all data** from the latest backup

## 🚀 Recommended Process

### Step 1: Verify Backup
The backup has already been completed and contains all critical data.

### Step 2: Run Complete Reset & Restore
```bash
cd backend/api
npm run reset-and-restore
```

### Step 3: Test Services
After the reset completes, test each service:

```bash
# Test Auth Service
cd backend/auth
npm run dev

# Test API Service  
cd backend/api
npm run dev

# Test Frontend
cd frontend
npm run dev
```

## 🎯 Expected Results

After running the reset and restore:

✅ **Auth Service**: Will compile and start without errors  
✅ **API Service**: Will compile and start without errors  
✅ **Frontend**: Will connect to services successfully  
✅ **Data Integrity**: All users, products, orders preserved  
✅ **Admin Features**: User role filter will work correctly  
✅ **Enhanced Messaging**: New messaging system will be functional  

## ⚠️ Important Notes

1. **Data Safety**: All data is safely backed up before any schema changes
2. **Downtime**: Services will be unavailable during the reset process (~2-3 minutes)
3. **Auth Tokens**: Refresh tokens are backed up, but users may need to re-login
4. **Testing**: Always test all critical functions after restoration

## 🔧 Manual Restore (If Needed)

If you need to restore from a specific backup file:

```bash
cd backend/api
npm run restore-db backups/database-backup-2025-06-20T21-07-04-438Z.json
```

## 📋 Schema Changes Made

The updated schema includes:

### User Model Enhancements:
- `isEnterpriseVendor: Boolean`
- `companyName: String?`
- `locationCity: String?`
- `locationState: String?`
- `businessLicense: String?`
- `certifications: String[]`
- `specialties: String[]`

### Message Model Enhancements:
- `messageType: MessageType`
- `context: String?` (JSON)
- `attachments: String?` (JSON)
- `readAt: DateTime?`
- `conversationId: String?`

### New Models:
- `Conversation` (structured conversations)
- `ConversationParticipant` (conversation members)

### New Enums:
- `MessageType` (GENERAL, PRODUCT_INQUIRY, etc.)
- `ConversationType` (DIRECT_MESSAGE, VENDOR_INQUIRY, etc.)
- `ConversationStatus` (ACTIVE, ARCHIVED, CLOSED)

## 🎉 Ready to Proceed

The backup is complete and all scripts are ready. Run the reset and restore process when you're ready to fix all the compilation errors and deploy the enhanced features.

```bash
cd backend/api
npm run reset-and-restore
``` 