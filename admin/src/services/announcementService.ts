import api from "../api/axios";

export interface Announcement {
  _id?: string;
  title: string;
  message: string;
  status: boolean;
}

// Get All Announcements
export const getAnnouncements = async () => {
  const res = await api.get("/announcements");
  return res.data;
};

// Get Single Announcement
export const getAnnouncement = async (id: string) => {
  const res = await api.get(`/announcements/${id}`);
  return res.data;
};

// Create Announcement
export const createAnnouncement = async (
  data: Announcement
) => {
  const res = await api.post(
    "/announcements",
    data
  );

  return res.data;
};

// Update Announcement
export const updateAnnouncement = async (
  id: string,
  data: Partial<Announcement>
) => {
  const res = await api.put(
    `/announcements/${id}`,
    data
  );

  return res.data;
};

// Delete Announcement
export const deleteAnnouncement = async (
  id: string
) => {
  const res = await api.delete(
    `/announcements/${id}`
  );

  return res.data;
};