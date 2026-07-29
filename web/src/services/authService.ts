import api from "../api/axios";

export const registerUser = async (data: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  referralCode?: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const verifyRegistrationOtp = async (data: {
  mobile: string;
  otp: string;
}) => {
  const res = await api.post("/auth/verify-registration-otp", data);
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data: {
  mobile: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};