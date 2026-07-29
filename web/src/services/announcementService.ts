import api from "../api/axios";

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  status?: boolean;
  createdAt?: string;
}

export const getAnnouncements = async (): Promise<{
  success: boolean;
  announcements: Announcement[];
}> => {
  const res = await api.get("/announcements");
  return res.data;
};
