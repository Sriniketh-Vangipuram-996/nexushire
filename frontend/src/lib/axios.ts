import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { API_BASE_PATH } from "../config/api";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/${API_BASE_PATH}`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;

  if (user?.tenantId) {
    config.headers["tenant-id"] = user.tenantId;
  }

  return config;
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (!original || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    const url = original.url ?? "";

    // Never try to refresh after public/authentication requests
    // or after the refresh request itself fails.
    const excludedRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/verify-email",
      "/auth/refresh",
      "/auth/logout",
      "/auth/reset-password",
      "/auth/request-password-reset",
    ];

    if (excludedRoutes.some((route) => url.includes(route))) {
      return Promise.reject(err);
    }

    if (original._retry) {
      return Promise.reject(err);
    }

    original._retry = true;

    try {
      // Concurrent 401s share one refresh request.
      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh", {}, { withCredentials: true })
          .then(async (refreshRes) => {
            await useAuthStore
              .getState()
              .login(refreshRes.data.user);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      return api(original);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);

export default api;