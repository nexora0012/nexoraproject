import api from "../api/axios";

export interface Payment {
  _id: string;
  plan?: { _id: string; title: string } | null;
  amount: number;
  method: "Wallet" | "Razorpay";
  status: "Created" | "Pending" | "Success" | "Failed" | "Refunded";
  transactionId?: string;
  createdAt: string;
}

export const getPaymentHistory = async (): Promise<{
  success: boolean;
  payments: Payment[];
}> => {
  const res = await api.get("/payments/history");
  return res.data;
};
