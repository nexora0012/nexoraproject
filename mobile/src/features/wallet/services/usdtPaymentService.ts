 

import api from '../../../core/api/axios';

export const getUsdtPayment = async () => {
  const response = await api.get('/usdt-payment');
  return response.data;
};