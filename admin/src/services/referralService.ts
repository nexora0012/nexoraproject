import api from '../api/axios';

export const getReferralSettings = async () => {
  const res = await api.get('/referral/settings');
  return res.data;
};

export const updateReferralSettings = async (data: {
  enabled: boolean;
  rewardType: string;
  rewardValue: number;
  minPurchaseAmount: number;
  newUserBonus: number;
}) => {
  const res = await api.put('/referral/settings', data);
  return res.data;
};

export const getAllReferrals = async () => {
  const res = await api.get('/referral/admin/all');
  return res.data;
};