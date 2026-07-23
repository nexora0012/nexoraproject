import api from "../api/axios";
export type ReturnStatus =
  | 'Pending'
  | 'Processing'
  | 'Credited'
  | 'Failed'
  | 'NotApplicable';

export interface ReturnUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  walletBalance: number;
}

export interface ReturnPlan {
  _id: string;
  title: string;
  price: number;
  duration: number;
  returnAmount: number;
}

export interface ReturnSubscription {
  _id: string;

  user: ReturnUser;
  plan: ReturnPlan;

  amountPaid: number;
  returnAmount: number;

  startDate: string;
  endDate: string;

  status:
    | 'Active'
    | 'Expired'
    | 'Cancelled';

  returnStatus: ReturnStatus;

  returnCreditedAt?: string;
  returnFailureReason?: string;

  overdueDays: number;
}

export interface ReturnMetric {
  count: number;
  amount: number;
}

export interface ReturnSummary {
  pending: ReturnMetric;
  processing: ReturnMetric;
  failed: ReturnMetric;
  credited: ReturnMetric;
  overdue: ReturnMetric;
}

export const getReturnSummary =
  async (): Promise<ReturnSummary> => {
    const response = await api.get(
      '/admin/returns/summary',
    );

    return response.data.summary;
  };

export const getReturns = async (
  params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
) => {
  const response = await api.get(
    '/admin/returns',
    {
      params,
    },
  );

  return response.data;
};

export const processReturn = async (
  subscriptionId: string,
) => {
  const response = await api.post(
    `/admin/returns/${subscriptionId}/process`,
  );

  return response.data;
};

export const retryReturn = async (
  subscriptionId: string,
) => {
  const response = await api.post(
    `/admin/returns/${subscriptionId}/retry`,
  );

  return response.data;
};