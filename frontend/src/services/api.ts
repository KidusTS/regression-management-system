import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login/register legitimately answer 401 for bad credentials; the form shows that
// error itself, so those requests must not trigger a "session expired" logout.
const isAuthRequest = (url?: string) => !!url && /\/auth\/(login|register)/.test(url);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        toast.error("Your session has expired. Please sign in again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
