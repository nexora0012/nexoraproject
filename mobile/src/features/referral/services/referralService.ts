import api from '../../../core/api/axios';

export const getMyReferralSummary = async () => {
  const response = await api.get('/referral/my-summary');
  return response.data;
};