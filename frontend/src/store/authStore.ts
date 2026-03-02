import {create} from "zustand";
import api from "../lib/axios";

type User = {
  _id: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;

  name?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;

  avatar?: string | null;
  resume?: string | null;
};

type AuthState={
    isAuthenticated:boolean;
    isLoading:boolean;
    user:User | null;
    token:string | null;
    login:(userFromRefresh?: User)=>Promise<void>;
    checkAuth:()=>Promise<void>;
    logout:()=>Promise<void>;
    setUser: (user: User) => void;   
    updateUser:(partial:Partial<User>)=>void;
    setToken:(token:string)=>void;  
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token:null,

    login: async (userFromRefresh?: User) => {
        if(userFromRefresh){
            set({
            isAuthenticated: true,
            user: userFromRefresh,
            isLoading: false,
            });
        } 
        else {
            const res = await api.get("/api/auth/me");
            set({
            isAuthenticated: true,
            user: res.data.user,
            isLoading: false,
            });
        }
    },


    logout: async () => {
        try {
            await api.post("/api/auth/logout");
        } catch {
            console.error("Logout failed");
        }

        set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
        });
    },

    checkAuth: async () => {
        try {
            const res = await api.post("/api/auth/refresh",{}, { withCredentials: true });

            set({
                isAuthenticated: true,
                user: res.data.user,
            });
        } catch {
            set({
                isAuthenticated: false,
                user: null,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    setUser:(user)=>set({user}),
    updateUser:(partial)=>
        set((state)=>({
            user:state.user?{...state.user,...partial}:null
        })),

    setToken:(token)=>set({token})
}));
