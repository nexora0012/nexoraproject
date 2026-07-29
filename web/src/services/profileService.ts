import api from "../api/axios";

export interface ProfileData {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  profileImage?: string;
  walletBalance?: number;
}

export const getProfile = async (): Promise<{
  success: boolean;
  user: ProfileData;
}> => {
  const res = await api.get("/user/profile");
  return res.data;
};

export const updateProfile = async (data: {
  fullName?: string;
  email?: string;
  mobile?: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: ProfileData;
}> => {
  const res = await api.put("/user/profile", data);
  return res.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};
