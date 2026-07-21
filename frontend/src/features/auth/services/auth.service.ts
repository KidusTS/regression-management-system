import { api } from "@/services/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>("/auth/login", data);
    return res.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>("/auth/register", data);
    return res.data.data;
  },
};
