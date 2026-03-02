import { useState } from "react";
import api from "../lib/axios";

const ForgotPasswordPage=()=>{
    const[email,setEmail]=useState("");
    const[message,setMessage]=useState("");

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();

        try{
        await api.post("/api/auth/request-password-reset",{
            email,
        });

        setMessage("Reset Link sent to Email");
    }
    catch{
        setMessage("Something went wrong ! Try Again.");
    }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Forgot Password</h1>

            <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />

            <button type="submit">Send Reset Link</button>

            {message && <p>{message}</p>}
        </form>
    )
};

export default ForgotPasswordPage;