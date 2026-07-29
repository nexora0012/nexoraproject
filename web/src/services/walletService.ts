import api from "../api/axios";

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

export interface WalletTransaction {
  _id: string;
  type: "credit" | "debit";
  category?: string;
  amount: number;
  description: string;
  createdBy: string;
  subscription?: string;
  referenceId?: string;
  createdAt: string;
}

export const getWalletSummary = async (): Promise<{
  success: boolean;
  summary: WalletSummary;
}> => {
  const res = await api.get("/wallet/summary");
  return res.data;
};

export const getTransactions = async (): Promise<{
  success: boolean;
  transactions: WalletTransaction[];
}> => {
  const res = await api.get("/wallet/transactions");
  return res.data;
};
