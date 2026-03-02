import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import api from "../lib/axios";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import TableView from "../components/TableView";
import KanbanView from "../components/KanbanView";
import { disconnectSocket } from "../socket";


type Job = {
  _id: string;
  companyName: string;
  role: string;
  status: string;
  appliedDate: string;
  notes?: string;
};

const DashboardPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const[selectedJobs,setSelectedJobs]=useState<string[]>([]);
  const[bulkStatus,setBulkStatus]=useState("Interviewed");
  const[isBulkLoading,setIsBulkLoading]=useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const[viewMode,setViewMode]=useState<"table" | "kanban">("table");
  const[searchTerm,setSearchTerm]=useState("");
  const[statusFilter,setStatusFilter]=useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const user=useAuthStore((s)=>s.user);
 useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300);

  return () => clearTimeout(timer);
}, [searchTerm]);

  // Fetch jobs on mount
const fetchJobs = async () => {
    setError(""); // Clear previous errors
    try {
        const res = await api.get("/api/jobs");
        setJobs(res.data);
    } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.error || "Failed to load jobs");
        } else {
          setError("Failed to load jobs");
        }
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
        fetchJobs();
    }, []);
    

  // Logout handler
  const handleLogout = async () => {
    console.log("Before logout:", useAuthStore.getState().user);
    await logout();
    console.log("After logout:", useAuthStore.getState().user);
    toast.success("You Logged Out Successfully");
    navigate("/");
    disconnectSocket();
  };

  // Status change handler
  const handleStatusChange = async (
  id: string,
  newStatus: string
) => {
  setError("");

  // Save previous state for rollback
  const previousJobs = [...jobs];

  // Optimistic update
  setJobs((prev) =>
    prev.map((job) =>
      job._id === id
        ? { ...job, status: newStatus }
        : job
    )
  );

  try {
    await api.patch(`/api/jobs/${id}/status`, {
      status: newStatus,
    });
  } catch {
    // Rollback if failed
    setJobs(previousJobs);
    toast.error("Failed to update status");
  }
  };

  // Delete handlers
  const confirmDelete = async () => {
    if (!jobToDelete) return;
    const previousJobs=[...jobs];

    //Optimistic removal
    setJobs((prev)=>
      prev.filter((job)=>job._id!==jobToDelete)
    );

    setIsModalOpen(false);

    try {
      await api.delete(`/api/jobs/${jobToDelete}`);
      toast.success("Deleted Successfully");
    } catch {
      //Rollback
      setJobs(previousJobs);
      toast.error("Failed to delete job");
    } finally {
      setJobToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setJobToDelete(null);
  };

  const handleSelect=(id:string)=>{
    setSelectedJobs((prev)=>
    prev.includes(id)
        ?prev.filter((jobId)=>jobId!==id)
        :[...prev,id]
    );
  };

  const handleBulkUpdate=async()=>{
    if(selectedJobs.length===0)return;

    setIsBulkLoading(true);
    const previousJobs=[...jobs];
    //optimistic update
    setJobs((prev)=>
      prev.map((job)=>
        selectedJobs.includes(job._id)
        ? {...job,status:bulkStatus}
        : job
      )
    );

    try{
        await api.patch("/api/jobs/bulk/status",{
            jobIds:selectedJobs,
            status:bulkStatus,
        });

        setJobs((prev)=>
            prev.map((job)=>
            selectedJobs.includes(job._id)
            ? {...job,status:bulkStatus}
            : job
    ));
      setSelectedJobs([]);
    }
    catch{
        setJobs(previousJobs);
        toast.error("Bulk update failed");
    }finally{
        setIsBulkLoading(false);
    }
  }

  const handleSelectAll=()=>{
    if(selectedJobs.length===jobs.length){
        setSelectedJobs([]);
    }
    else{
        setSelectedJobs(jobs.map((job)=>job._id));
    }
  }

  const handleBulkDelete=async()=>{
    if(selectedJobs.length===0)return;
    setIsBulkLoading(true);
    setError("");

    const previousJobs=[...jobs];

    //optimistic removal
    setJobs((prev)=> prev.filter((job)=>!selectedJobs.includes(job._id)));

    setSelectedJobs([]);
    try{
        await api.delete("/api/jobs/bulk",{
            data:{jobIds:selectedJobs},//axios delete with body needs {data:{...}}
        });
    }
    catch{
      //Rollback
        setJobs(previousJobs);
        toast.error("Bulk delete failed.");
    }
    finally{
        setIsBulkLoading(false);
    }
  }

  

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  
  const filteredJobs = jobs.filter((job) => {
  const matchesSearch =
    job.companyName
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()) ||
    job.role
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    job.status === statusFilter;

  return matchesSearch && matchesStatus;
});


  return (
    <div>
      <h1>Your Job Applications</h1>
        
      <Link to="/profile">Profile</Link>
      {" | "}
      <Link to="/jobs/new">+ Add Job</Link>
      {" | "}
      <Link to="/analytics">Analytics</Link>
        
      {/* 👇 Only visible to admin */}
      {user?.role === "admin" && (
        <>
          {" | "}
          <Link to="/admin" style={{ fontWeight: "bold", color: "purple" }}>
            Admin Dashboard
          </Link>
        </>
      )}
      
      <button style={{ float: "right" }} onClick={handleLogout}>
        Logout
      </button>
      <div style={{marginBottom:"20px"}}>
        <input
        type="text"
        placeholder="Search by company or role..."
        value={searchTerm}
        onChange={(e)=>setSearchTerm(e.target.value)} 
        />
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div style={{marginBottom:"20px"}}>
        <select value={bulkStatus} onChange={(e)=>setBulkStatus(e.target.value)}>
            <option value="Applied">Applied</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
        </select>
         <input
          type="checkbox"
          checked={
            jobs.length>0 && selectedJobs.length===jobs.length
          }
          onChange={handleSelectAll}
         />
         <span>Select All</span>
         {selectedJobs.length>0 && (
            <p>{selectedJobs.length} selected</p>
         )}
         <button onClick={handleBulkDelete} disabled={selectedJobs.length===0 || isBulkLoading}>Delete Selected</button>
        <button onClick={handleBulkUpdate} disabled={selectedJobs.length===0 || isBulkLoading}>{isBulkLoading? "Updating...":"Update Selected"}</button>
      </div>

      <div style={{marginBottom:"20px"}}>
        <button onClick={()=>setViewMode("table")} disabled={viewMode==="table"}>Table View</button>
        <button onClick={()=>setViewMode("kanban")} disabled={viewMode==="kanban"}>Kanban View</button>
      </div>
      {jobs.length === 0 ? (
  <p>No job applications yet.</p>
) : viewMode === "table" ? (
  <TableView
  jobs={filteredJobs}
  selectedJobs={selectedJobs}
  onSelect={handleSelect}
  onStatusChange={handleStatusChange}
  onDeleteClick={(id) => {
    setJobToDelete(id);
    setIsModalOpen(true);
  }}
/>

) : (
  <KanbanView
    jobs={filteredJobs}
    onStatusChange={handleStatusChange}
  />
)}


      <ConfirmModal
        isOpen={isModalOpen}
        message="Are you sure you want to delete this job application?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default DashboardPage;
