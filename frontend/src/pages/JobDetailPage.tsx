import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import axios from "axios";

type Job={
    _id:string;
    companyName:string;
    role:string;
    status:string;
    appliedDate:string;
    notes?:string;
};

const JobDetailPage=()=>{
    const {id}=useParams();
    const [job,setJob]=useState<Job|null>(null);
    const[loading,setLoading]=useState(true);
    const[error,setError]=useState("");

    useEffect(()=>{
        const fetchJob=async()=>{
            try{
                const res=await api.get(`/jobs/${id}`);
                setJob(res.data);
            }
            catch(err){
                if(axios.isAxiosError(err)){
                    setError(err.response?.data?.error);
                }
                else{
                    setError("Failed to load job.");
                }
            }
            finally{
                setLoading(false);
            }
        };
        fetchJob();
    },[id]);

    if(loading)return <p>Loading...</p>;
    if(error)return <p>{error}</p>;
    if(!job)return <p>Job Not Found</p>;

    return (
        <div>
            <h1>{job.companyName}</h1>
            <p><strong>Role:</strong>{job.role}</p>
            <p><strong>Status:</strong>{job.status}</p>
            <p>
                <strong>Applied:</strong>{" "}
                {new Date(job.appliedDate).toLocaleDateString()}
            </p>

            {job.notes && (
                <p>
                    <strong>Notes:</strong>{job.notes}
                </p>
            )}
        </div>
    )

}

export default JobDetailPage;