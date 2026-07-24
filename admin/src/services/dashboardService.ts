import api from "../api/axios";

export const getDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};