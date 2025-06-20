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
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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
  specifications?: ProductSpecification[];
  isAuction: boolean;
  auctionEndDate?: Date;
  currentBid?: number;
  minimumBid?: number;
  buyNowPrice?: number;
  location?: Address;
  createdAt: Date;
  updatedAt: Date;
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
  name: string;
  value: string;
  unit?: string;
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

export interface Bid {
  id: string;
  userId: string;
  user?: User;
  bidder?: User; // Alias for user for backward compatibility
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
  // Individual shipping fields for backward compatibility
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  paymentMethod?: PaymentMethod;
  // Individual payment fields for backward compatibility
  paymentType?: string;
  paymentLast4?: string;
  paymentBrand?: string;
  stripeFee?: number;
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
  BANK_TRANSFER = 'BANK_TRANSFER'
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  ENDING_SOON = 'endingSoon'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
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
  REVIEW_RECEIVED = 'REVIEW_RECEIVED'
} 