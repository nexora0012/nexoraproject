// this file create a new 

import api from '../api/axios';

export const getUsdtPayment = async () => {
  const res = await api.get('/usdt-payment');
  return res.data;
};

export const updateUsdtPayment = async (image: File | null, description: string) => {
  const formData = new FormData();

  if (image) {
    formData.append('image', image);
  }

  formData.append('description', description);

  const res = await api.put('/usdt-payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};