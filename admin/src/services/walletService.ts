import api from "../api/axios";

export const getTransactions = async () => {
  const res = await api.get("/wallet");
  return res.data;
};

export const creditWallet = async (
  userId: string,
  amount: number,
  description?: string
) => {
  const res = await api.post(`/wallet/credit/${userId}`, {
    amount,
    description,
  });

  return res.data;
};

export const debitWallet = async (
  userId: string,
  amount: number,
  description?: string
) => {
  const res = await api.post(`/wallet/debit/${userId}`, {
    amount,
    description,
  });

  return res.data;
};

export const searchTransactions = async (
  search: string,
  type: string
) => {
  const res = await api.get("/wallet", {
    params: {
      search,
      type,
    },
  });

  return res.data;
};
