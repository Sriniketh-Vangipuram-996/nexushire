import React from "react";

type Job = {
  _id: string;
  companyName: string;
  role: string;
  status: string;
};

type Props = {
  jobs: Job[];
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
};

const statuses = ["Applied", "Interviewed", "Offer", "Rejected"];

const colors: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Applied: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    dot: "#2563EB",
  },
  Interviewed: {
    bg: "#FEF3C7",
    text: "#92400E",
    dot: "#F59E0B",
  },
  Offer: {
    bg: "#D1FAE5",
    text: "#047857",
    dot: "#10B981",
  },
  Rejected: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    dot: "#EF4444",
  },
};

const KanbanView: React.FC<Props> = ({
  jobs,
  onStatusChange,
}) => {
  const handleDrop = async (
    e: React.DragEvent,
    newStatus: string
  ) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    await onStatusChange(jobId, newStatus);
  };

  const handleDragStart = (
    e: React.DragEvent,
    jobId: string
  ) => {
    e.dataTransfer.setData("jobId", jobId);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        width: "100%",
      }}
    >
      {statuses.map((status) => {
        const style = colors[status];
        const columnJobs = jobs.filter(
          (j) => j.status === status
        );

        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              height: "560px",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: style.bg,
                color: style.text,
                padding: "14px 16px",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: style.dot,
                  }}
                />
                {status}
              </div>

              <div
                style={{
                  background: "#fff",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: 13,
                  color: "#334155",
                }}
              >
                {columnJobs.length}
              </div>
            </div>

            {/* Cards */}
            <div
              style={{
                padding: 12,
                overflowY: "auto",
                flex: 1,
              }}
            >
              {columnJobs.length === 0 ? (
                <div
                  style={{
                    border: "2px dashed #CBD5E1",
                    borderRadius: 10,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  Drop here
                </div>
              ) : (
                columnJobs.map((job) => (
                  <div
                    key={job._id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, job._id)
                    }
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "12px",
                      cursor: "grab",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 4,
                        background: style.dot,
                        borderRadius: 999,
                        marginBottom: 10,
                      }}
                    />

                    <div
                      style={{
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: 6,
                      }}
                    >
                      {job.companyName}
                    </div>

                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      {job.role}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;