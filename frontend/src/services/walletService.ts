import { ApiResponse, PaginatedResponse } from '../../../shared/types';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5001';

export interface WalletBalance {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  reference?: string;
  createdAt: string;
}

export interface WalletStats {
  totalDeposits: number;
  totalSpent: number;
  transactionCount: number;
  currentBalance: number;
  lockedBalance: number;
}

export interface AddFundsRequest {
  amount: number;
  description: string;
  reference?: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  reference?: string;
}

export class WalletService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getBalance(): Promise<WalletBalance> {
    const response = await fetch(`${API_URL}/api/wallet/balance`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet balance');
    }

    const data: ApiResponse<WalletBalance> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch wallet balance');
    }

    return data.data!;
  }

  async addFunds(request: AddFundsRequest): Promise<{ balance: number; transaction: WalletTransaction }> {
    const response = await fetch(`${API_URL}/api/wallet/add-funds`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to add funds');
    }

    const data: ApiResponse<{ balance: number; transaction: WalletTransaction }> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to add funds');
    }

    return data.data!;
  }

  async makePayment(request: PaymentRequest): Promise<{ balance: number; transaction: WalletTransaction }> {
    const response = await fetch(`${API_URL}/api/wallet/pay`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    const data: ApiResponse<{ balance: number; transaction: WalletTransaction }> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to process payment');
    }

    return data.data!;
  }

  async getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await fetch(`${API_URL}/api/wallet/transactions?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const data: ApiResponse<PaginatedResponse<WalletTransaction>> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch transactions');
    }

    return data.data!;
  }

  async getStats(): Promise<WalletStats> {
    const response = await fetch(`${API_URL}/api/wallet/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet stats');
    }

    const data: ApiResponse<WalletStats> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch wallet stats');
    }

    return data.data!;
  }
}

export const walletService = new WalletService(); 