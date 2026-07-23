import api from "./api";

export const getAnnouncements = async () => {
  const response = await api.get("/announcements");
  return response.data;
};