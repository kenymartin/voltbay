# VoltBay Wallet System Implementation Plan

## Overview
Implement a comprehensive wallet system for VoltBay to enable instant payments, escrow protection, and enhanced user experience for both auctions and direct purchases.

## Phase 1: Core Wallet Infrastructure (Week 1-2)

### Database Schema Extensions
```sql
-- Add to existing Prisma schema
model Wallet {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  balance       Decimal  @default(0.00) @db.Decimal(10, 2)
  lockedBalance Decimal  @default(0.00) @db.Decimal(10, 2) // For pending auctions
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  transactions  WalletTransaction[]
  
  @@map("wallets")
}

model WalletTransaction {
  id          String            @id @default(cuid())
  walletId    String
  wallet      Wallet            @relation(fields: [walletId], references: [id])
  type        TransactionType
  amount      Decimal           @db.Decimal(10, 2)
  status      TransactionStatus @default(PENDING)
  description String
  reference   String?           // Order ID, Payment ID, etc.
  metadata    Json?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  @@map("wallet_transactions")
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  PURCHASE
  REFUND
  AUCTION_HOLD
  AUCTION_RELEASE
  SELLER_PAYOUT
  PLATFORM_FEE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Backend Services

#### WalletService
- `createWallet(userId: string)`
- `getBalance(userId: string)`
- `addFunds(userId: string, amount: number, paymentMethodId: string)`
- `holdFunds(userId: string, amount: number, reference: string)` // For auctions
- `releaseFunds(userId: string, amount: number, reference: string)`
- `deductFunds(userId: string, amount: number, description: string)`
- `transferFunds(fromUserId: string, toUserId: string, amount: number)`

#### EscrowService
- `createEscrow(orderId: string, buyerId: string, sellerId: string, amount: number)`
- `releaseEscrow(orderId: string, reason: string)`
- `refundEscrow(orderId: string, reason: string)`

### API Endpoints
```typescript
// Wallet management
POST   /api/wallet/add-funds
GET    /api/wallet/balance
GET    /api/wallet/transactions
POST   /api/wallet/withdraw

// Escrow operations
POST   /api/escrow/create
POST   /api/escrow/:id/release
POST   /api/escrow/:id/refund
```

## Phase 2: Auction Integration (Week 3)

### Pre-Auction Holds
- Users must have sufficient wallet balance to bid
- Funds are held (locked) for highest bidders
- Released when outbid, deducted when winning

### Auto-Payment System
- Instant payment processing when auction ends
- No manual payment step required
- Automatic escrow creation for buyer protection

## Phase 3: Enhanced Features (Week 4-5)

### Auto-Recharge
- Set minimum balance thresholds
- Automatic top-ups from saved payment methods
- Notification system for low balances

### Seller Payouts
- Weekly/bi-weekly seller payout schedules
- Automatic platform fee deduction
- Payout history and reporting

### Subscription Support
- Monthly solar equipment leasing
- Automatic recurring payments
- Subscription management interface

## Phase 4: Advanced Features (Week 6+)

### Multi-Currency Support
- Support for different currencies
- Automatic conversion rates
- International transaction handling

### Rewards Program
- Cashback for frequent buyers
- Seller incentives
- Referral bonuses

### Corporate Wallets
- Business account management
- Approval workflows for large purchases
- Expense tracking and reporting

## Security Considerations

### Compliance
- PCI DSS compliance for stored value
- Money transmission license requirements
- Anti-money laundering (AML) compliance
- Know Your Customer (KYC) verification for large amounts

### Technical Security
- Encrypted wallet balance storage
- Two-factor authentication for withdrawals
- Transaction rate limiting
- Fraud detection algorithms
- Audit trails for all transactions

## Implementation Priority

### High Priority (Must Have)
1. ✅ Basic wallet creation and balance management
2. ✅ Add funds via Stripe
3. ✅ Auction bid holding system
4. ✅ Escrow for order protection
5. ✅ Basic transaction history

### Medium Priority (Should Have)
1. ⚠️ Auto-recharge functionality
2. ⚠️ Seller payout automation
3. ⚠️ Withdrawal to bank account
4. ⚠️ Mobile wallet UI optimization

### Low Priority (Nice to Have)
1. 📋 Multi-currency support
2. 📋 Rewards program
3. 📋 Corporate wallet features
4. 📋 Advanced analytics

## Estimated Timeline
- **Phase 1**: 2 weeks (Core infrastructure)
- **Phase 2**: 1 week (Auction integration)
- **Phase 3**: 2 weeks (Enhanced features)
- **Phase 4**: 4+ weeks (Advanced features)

**Total MVP**: 5 weeks for fully functional wallet system

## Success Metrics
- 📈 Auction completion rate (target: >95%)
- 📈 User retention (target: +25%)
- 📈 Average order value (target: +30%)
- 📈 Platform transaction volume (target: +50%)
- 📉 Payment abandonment rate (target: <5%) 