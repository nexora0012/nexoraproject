export const changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {

  const response = await api.put(
    `/profile/change-password/${userId}`,
    {
      currentPassword,
      newPassword,
    }
  );

  return response.data;

};