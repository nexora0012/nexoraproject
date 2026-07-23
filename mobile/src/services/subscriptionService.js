import api from "./api";

export const getUserSubscription = async (userId) => {
  const response = await api.get(
    `/subscriptions/user/${userId}`
  );

  return response.data;
};
export const getSubscriptionHistory = async (
  userId
) => {
  const response = await api.get(
    `/subscriptions/history/${userId}`
  );

  return response.data;
};
export const renewSubscription = async (
  subscriptionId
) => {
  const response = await api.put(
    `/subscriptions/renew/${subscriptionId}`
  );

  return response.data;
};