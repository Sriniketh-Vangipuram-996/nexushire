import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api=axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials:true,
});

api.interceptors.response.use(//intercepts every response, (middleware for frontend)
    (res)=>res, //returns succesfull response as-is.
    async(err)=>{ //runs for errors.
        const original=err.config;

        if(err.response?.status==401 && !original._retry && !original.url.includes("/refresh")){
            original._retry=true;//prevents infinite loop if refresh also fails
            try{
                const refreshRes=await api.post("/api/auth/refresh");//helps user to see data without manually refresh the page.
                await useAuthStore.getState().login(refreshRes.data.user);
                return api(original);//resends the exact same request that failed.
            }
            catch{
                useAuthStore.getState().logout();
                return Promise.reject(err);
            }
        }
        return Promise.reject(err);//if error is not 401 or refresh fails, reject the promise so that component can handle it normally.
    }
)

export default api;