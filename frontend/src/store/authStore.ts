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

  login: async (userFromRefresh) => {
    if (userFromRefresh) {
      const merged = {
        ...get().user,
        ...userFromRefresh,
      };

      set({
        isAuthenticated: true,
        user: merged,
        isLoading: false,
      });
      return;
    }

    const res = await api.get("/auth/me");

    const merged = {
      ...get().user,
      ...res.data.user,
    };

    set({
      isAuthenticated: true,
      user: merged,
      isLoading: false,
    });
  },

  checkAuth: async () => {
  try {
    const me = await api.get("/auth/me");

    set({
      isAuthenticated: true,
      user: me.data.user,
    });
  } catch {
    try {
      const refresh = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );

      set({
        isAuthenticated: true,
        user: refresh.data.user,
      });
    } catch {
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  } finally {
    set({ isLoading: false });
  }
},

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.error("Logout failed");
    }

    set({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
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