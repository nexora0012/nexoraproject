import api from '../../../core/api/axios';

export type WalletTransactionCategory =
  | 'AdminCredit'
  | 'AdminDebit'
  | 'PlanPurchase'
  | 'MaturityReturn'
  | 'Refund'
  | 'Other';

export interface WalletTransaction {
  _id: string;

  type: 'credit' | 'debit';

  category:
    WalletTransactionCategory;

  amount: number;
  description: string;
  createdBy: string;
  createdAt: string;

  subscription?: string | null;
  referenceId?: string | null;
}

export interface WalletSummary {
  balance: number;
  totalCredit: number;
  totalDebit: number;

  todayCredit: number;
  todayDebit: number;

  pendingReturn: number;
  pendingReturnCount: number;

  totalMaturityReturn: number;
}

interface TransactionsResponse {
  success: boolean;
  message?: string;
  transactions: WalletTransaction[];
}

interface WalletSummaryResponse {
  success: boolean;
  message?: string;
  summary: WalletSummary;
}

export const getTransactions =
  async (): Promise<TransactionsResponse> => {
    const response =
      await api.get<TransactionsResponse>(
        '/wallet/transactions',
      );

    return response.data;
  };

export const getWalletSummary =
  async (): Promise<WalletSummaryResponse> => {
    const response =
      await api.get<WalletSummaryResponse>(
        '/wallet/summary',
      );

    return response.data;
  };