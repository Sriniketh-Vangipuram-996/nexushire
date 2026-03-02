import {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import api from "../lib/axios";

export  const  SignupPage=()=>{
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[isLoading,setIsLoading]=useState(false);
    const[error,setError]=useState<string |null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        setError(null);

        if(!email.includes("@")){
            setError("Invalid Email");
            return;
        }
        if(password.length<6 || !/[^A-Za-z0-9]/.test(password)){
            setError("Password must be atleast 6 characters and contain a special character.");
            return;
        }

        try{
            setIsLoading(true);
            await api.post("/api/auth/signup",{
                email,
                password
            },
        {withCredentials:true});
            toast.success("Account created successfully.");
            setSuccess(
                "Account created. Please check your email to verify."
            );
            
        }
        catch(err){
            if(axios.isAxiosError(err)){
                setError(err.response?.data?.error||"Something went wrong.")
            }
            else{
                setError("Something went wrong. Please try again.");
            }
        }
        finally{
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Create your Account</h1>

            <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />

            <input
            type="password"
            value={password}
            placeholder="password"
            onChange={(e)=>setPassword(e.target.value)}
            />

            {error && <p>{error}</p>}
            {!error && success && <p style={{ color: "green" }}>{success}</p>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account" : "SignUp"}
            </button>
        </form>
    );
};

export default SignupPage;