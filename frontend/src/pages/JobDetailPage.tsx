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

    if (loading) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-500">Loading job details...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          !
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Unable to load job
        </h2>
        <p className="text-slate-500 mt-2">{error}</p>
      </div>
    </div>
  );
}

if (!job) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <p className="text-slate-500">Job not found.</p>
    </div>
  );
}

const statusColor = {
  Applied: "bg-blue-100 text-blue-700",
  Interviewed: "bg-amber-100 text-amber-700",
  Offer: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
}[job.status] ?? "bg-slate-100 text-slate-700";

return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-2">
              Job Application
            </p>

            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {job.companyName}
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mt-2">
              {job.role}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}
          >
            {job.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-slate-500 mb-2">Application Date</p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {new Date(job.appliedDate).toLocaleDateString()}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-slate-500 mb-2">Current Status</p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {job.status}
          </h3>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Notes
        </h2>

        {job.notes ? (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {job.notes}
          </p>
        ) : (
          <p className="text-slate-400 italic">
            No notes added for this application.
          </p>
        )}
      </div>
    </div>
  </div>
);
}

export default JobDetailPage;