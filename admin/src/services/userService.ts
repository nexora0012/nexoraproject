import api from "../api/axios";

export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const getUser = async (id: string) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const updateUser = async (id: string, data: Record<string, unknown>) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};