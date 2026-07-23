import api from '../../../core/api/axios';
import {getToken} from '../../../core/storage/storage';

export interface UserProfile {
  _id?: string;
  fullName: string;
  email: string;
  mobile: string;
  walletBalance: number;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  user: UserProfile;
}

interface UpdateProfileData {
  fullName: string;
  mobile: string;
}

export const getProfile =
  async (): Promise<ProfileResponse> => {
    const token = await getToken();

    const response =
      await api.get<ProfileResponse>(
        '/user/profile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

    return response.data;
  };

export const updateProfile = async (
  data: UpdateProfileData,
): Promise<ProfileResponse> => {
  const token = await getToken();

  const response =
    await api.put<ProfileResponse>(
      '/user/profile',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
};

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const changePassword = async (
  data: ChangePasswordData,
): Promise<ChangePasswordResponse> => {
  const token = await getToken();

  const response =
    await api.put<ChangePasswordResponse>(
      '/auth/change-password',
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

  return response.data;
};