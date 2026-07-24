import api from '../../../core/api/axios';

export const registerUser = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyRegistrationOtp = async (data: {mobile: string; otp: string}) => {
  const response = await api.post('/auth/verify-registration-otp', data);
  return response.data;
};

export const resendOtp = async (mobile: string) => {
  const response = await api.post('/auth/resend-otp', {mobile});
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', {email});
  return response.data;
};

export const resetPassword = async (data: {
  mobile: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};