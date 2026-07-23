import api from "./api";

export const getSettings = async (userId) => {

  const res = await api.get(
    `/account-settings/${userId}`
  );

  return res.data;

};

export const updateSettings = async (
  userId,
  data
) => {

  const res = await api.put(
    `/account-settings/${userId}`,
    data
  );

  return res.data;

};