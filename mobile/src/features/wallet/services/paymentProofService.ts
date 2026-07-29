import api from '../../../core/api/axios';

export const submitPaymentProof = async (
  imageUri: string,
  accountDetails: string,
) => {
  const formData = new FormData();

  formData.append('screenshot', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'proof.jpg',
  } as any);

  formData.append('accountDetails', accountDetails);

  const response = await api.post('/payment-proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
export const getMyProofs = async () => {
  const response = await api.get('/payment-proof/my');
  return response.data;
};