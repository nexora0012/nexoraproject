import api from '../api/axios';

export const getProofs = async () => {
  const res = await api.get('/payment-proof/admin');
  return res.data;
};

export const updateProofStatus = async (id: string, status: string) => {
  const res = await api.put(`/payment-proof/admin/${id}`, { status });
  return res.data;
};