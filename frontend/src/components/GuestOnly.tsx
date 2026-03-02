import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const GuestOnly=({children}:{children:React.ReactNode})=>{
    const{user,isLoading}=useAuthStore();

    if(isLoading)return <p>Loading...</p>

    if(user)return <Navigate to="/dashboard" replace/>;
    return children;
}

export default GuestOnly;