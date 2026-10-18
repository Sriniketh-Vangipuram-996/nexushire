
import { create } from "zustand";
import api from "../lib/axios";

export type User = {
  _id: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  tenantId: string;

  name?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;

  avatar?: string | null;
  resume?: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;

  login: (userFromRefresh?: User) => Promise<void>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;

  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  setToken: (token: string) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,

  // Called after login, or with the user returned by a refresh.
  login: async (userFromRefresh) => {
    if (userFromRefresh) {
      set({
        isAuthenticated: true,
        user: {
          ...get().user,
          ...userFromRefresh,
        } as User,
        isLoading: false,
      });

      return;
    }

    try {
      const response = await api.get("/auth/me");

      set({
        isAuthenticated: true,
        user: response.data.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      throw error;
    }
  },

  // Restore the session when the app starts.
  // Axios handles a 401 and attempts refresh if appropriate.
  checkAuth: async () => {
    try {
      const response = await api.get("/auth/me");

      set({
        isAuthenticated: true,
        user: response.data.user,
      });
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear local authentication even if the server request fails.
      // The server should clear its refresh cookie when reachable.
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },

  setUser: (user) =>
    set((state) => ({
      user: {
        ...state.user,
        ...user,
      } as User,
    })),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...partial,
          }
        : null,
    })),

  setToken: (token) => set({ token }),
}));
