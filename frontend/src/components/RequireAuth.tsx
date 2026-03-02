import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RequireAuth=({children}:{children:React.ReactNode})=>{
    const{user,isLoading}=useAuthStore();

    if(isLoading)return <p>Checking auth...</p>

    if (!user) return <Navigate to="/login" replace />

    return children;
}

export default RequireAuth;