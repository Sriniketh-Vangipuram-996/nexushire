import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RequireRole=({role,children}:{role:"admin"|"user"; children:React.ReactNode})=>{
    const {user,isLoading}=useAuthStore();

    if(isLoading)return <p>Checking permission...</p>

    if(!user) return <Navigate to="/login" replace/>

    if(user.role!==role){
        return <Navigate to="/dashboard"replace/>
    }
    return children;
}

export default RequireRole;