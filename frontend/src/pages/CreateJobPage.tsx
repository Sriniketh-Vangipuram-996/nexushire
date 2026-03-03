import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";

const CreateJobPage=()=>{
    const navigate=useNavigate();

    const[form,setForm]=useState({
        companyName:"",
        role:"",
        description:"",
        status:"Applied",
        notes:"",
    });

    const[error,setError]=useState("");

    const handleChange=(e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)=>{
        setForm({...form,
            [e.target.name]:e.target.value,
        });
    };

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();

        try{
            await api.post("/jobs",form);
            navigate("/dashboard");
        }catch(err){
            if(axios.isAxiosError(err)){
                setError(err.response?.data?.error || "Failed to create job");
            }
            else{
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <h1>Add Job Application</h1>

            <input
            name="companyName"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            />
            <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            />

            <select
            name="status"
            value={form.status}
            onChange={handleChange}
            >
                <option>Applied</option>
                <option>Interview</option>
                <option>Rejected</option>
                <option>Offer</option>
            </select>
            <textarea
            name="description"
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            />
            <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            />
            <button type="submit">Save</button>

            {error && <p>{error}</p>}
        </form>
    )
}

export default CreateJobPage;