// Shared types for VoltBay marketplace

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  verified: boolean;
  avatar?: string;
  phone?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
  wallet?: Wallet;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  status: ProductStatus;
  condition: ProductCondition;
  categoryId: string;
  category?: Category;
  ownerId: string;
  owner?: User;
  isAuction: boolean;
  auctionEndDate?: Date;
  currentBid?: number;
  minimumBid?: number;
  buyNowPrice?: number;
  location?: Address;
  specifications?: ProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    bids: number;
  };
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED'
}

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  unit?: string;
}

export interface Bid {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  amount: number;
  isWinning: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  productId: string;
  product?: Product;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod?: PaymentMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentMethod {
  type: PaymentType;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET'
}

// Wallet-related types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  totalEarnings: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCard {
  id: string;
  userId: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  stripeCardId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  user?: User;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  description: string;
  orderId?: string;
  order?: Order;
  paymentCardId?: string;
  paymentCard?: PaymentCard;
  externalRef?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  FEE = 'FEE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  content: string;
  isRead: boolean;
  productId?: string;
  product?: Product;
  sentAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  productId: string;
  product?: Product;
  authorId: string;
  author?: User;
  orderId?: string;
  order?: Order;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export enum NotificationType {
  BID_PLACED = 'BID_PLACED',
  BID_OUTBID = 'BID_OUTBID',
  AUCTION_WON = 'AUCTION_WON',
  AUCTION_ENDED = 'AUCTION_ENDED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  WALLET_FUNDED = 'WALLET_FUNDED',
  WALLET_PAYMENT = 'WALLET_PAYMENT'
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Search and filter types
export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  location?: string;
  isAuction?: boolean;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  TITLE = 'title',
  ENDING_SOON = 'endDate'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
} 