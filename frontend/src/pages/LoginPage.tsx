import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import api from "../lib/axios";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";


const LoginPage=()=>{
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[loading,setLoading]=useState(false);
    const[error,setError]=useState<string |null>(null);
    const[params]=useSearchParams();
    const navigate=useNavigate();
    const {login}=useAuthStore();
    useEffect(()=>{
        if(params.get("verified")==="true"){
            toast.success("Email Verified successfully. Please log in.");
        }
    },[]);
    
    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        setError(null);
        if(!email || !password){
            setError("Email and password required.");
            return;
        }

        try{
            setLoading(true);
            await api.post("/api/auth/login",{
                email,password
            }
            );
            await login();
            toast.success("Account logged in successfully.");
            navigate("/dashboard");
        }
        catch(err){
            if(axios.isAxiosError(err)){
                setError(err.response?.data?.error || "Something went wrong.")
            }
            else{
                setError("Something went wrong, Please try again.");
            }
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            
            <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
            />

            <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            />

            {error && <p>{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? "Logging in " : "Log In"}
            </button>

            <p>
                <a href="/forgot-password">Forgot password</a>
            </p>

            <p>
                Dont have an account?{" "}
                <a href="/signup">Create one</a>
            </p>
        </form>
    )
}

export default LoginPage;