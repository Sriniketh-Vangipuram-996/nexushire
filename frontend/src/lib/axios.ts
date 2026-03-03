import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { API_BASE_PATH } from "../config/api";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/${API_BASE_PATH}`,
    withCredentials: true,
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        if (
            err.response?.status === 401 &&
            !original._retry &&
            !original.url.includes("/refresh")
        ) {
            original._retry = true;

            try {
                const refreshRes = await api.post(
                    "/auth/refresh"
                );

                await useAuthStore.getState().login(refreshRes.data.user);

                return api(original);
            } catch {
                useAuthStore.getState().logout();
                return Promise.reject(err);
            }
        }

        return Promise.reject(err);
    }
);

export default api;