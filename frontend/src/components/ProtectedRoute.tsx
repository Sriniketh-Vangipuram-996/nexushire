import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";


interface Props{
    children:React.ReactNode;
}

const ProtectedRoute=({children}:Props)=>{
    const {user,isAuthenticated,isLoading}=useAuthStore();

    if(isLoading)return <div>Loading...</div>;

    if(!user && !isAuthenticated){
        return <Navigate to="/login" replace/>
    }

    return children;
};

export default ProtectedRoute;