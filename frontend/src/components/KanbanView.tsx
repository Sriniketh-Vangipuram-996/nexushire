
type Job={
    _id:string;
    companyName:string;
    role:string;
    status:string;
};

type Props = {
  jobs: Job[];
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
};


const statuses=["Applied","Interviewed","Offer","Rejected"];

const KanbanView: React.FC<Props> = ({ jobs, onStatusChange }) => {

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: string
  ) => {
    const jobId = e.dataTransfer.getData("jobId");
    await onStatusChange(jobId, newStatus);
  };

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData("jobId", jobId);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {statuses.map((status) => (
        <div
          key={status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid gray",
            minHeight: "400px",
          }}
        >
          <h3>{status}</h3>

          {jobs
            .filter((job) => job.status === status)
            .map((job) => (
              <div
                key={job._id}
                draggable
                onDragStart={(e) => handleDragStart(e, job._id)}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  background: "#f5f5f5",
                  cursor: "grab",
                }}
              >
                <strong>{job.companyName}</strong>
                <p>{job.role}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};
export default KanbanView;