import api from "../api/axios";

export async function loginRequest(
  email: string,
  password: string
) {
  const response = await api.post("/admin/login", {
    email,
    password,
  });

  return response.data;
}