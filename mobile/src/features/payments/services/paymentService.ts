import api from '../../../core/api/axios';

export type PaymentMethod =
  | 'Wallet'
  | 'Razorpay';

export type PaymentStatus =
  | 'Created'
  | 'Pending'
  | 'Success'
  | 'Failed'
  | 'Refunded';

export interface PaymentPlan {
  _id: string;
  title: string;
  description?: string;
  duration?: number;
  returnAmount?: number;
}

export interface PaymentSubscription {
  _id: string;
  status:
    | 'Active'
    | 'Expired'
    | 'Cancelled';

  startDate: string;
  endDate: string;

  returnStatus?:
    | 'Pending'
    | 'Processing'
    | 'Credited'
    | 'Failed'
    | 'NotApplicable';
}

export interface Payment {
  _id: string;

  plan: PaymentPlan | null;

  subscription?:
    | PaymentSubscription
    | null;

  amount: number;
  currency: string;

  method: PaymentMethod;
  status: PaymentStatus;

  transactionId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;

  failureReason?: string;
  createdAt: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  message?: string;
  payments: Payment[];
}

export const getPaymentHistory =
  async (): Promise<Payment[]> => {
    const response =
      await api.get<PaymentHistoryResponse>(
        '/payments/history',
      );

    return response.data.payments || [];
  };