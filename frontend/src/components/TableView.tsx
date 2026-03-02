import { Link } from "react-router-dom";

type Job={
    _id:string;
    companyName:string;
    role:string;
    status:string;
};

type Props = {
  jobs: Job[];
  selectedJobs: string[];
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDeleteClick: (id: string) => void;
};


const TableView: React.FC<Props> = ({
  jobs,
  selectedJobs,
  onSelect,
  onStatusChange,
  onDeleteClick,
}) => {
  return (
    <table border={1} cellPadding={10} width="100%">
      <thead>
        <tr>
          <th></th>
          <th>Company</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {jobs.map((job) => (
          <tr key={job._id}>
            <td>
              <input
                type="checkbox"
                checked={selectedJobs.includes(job._id)}
                onChange={() => onSelect(job._id)}
              />
            </td>

            <td>
              <Link to={`/jobs/${job._id}`}>{job.companyName}</Link>
            </td>
            <td>{job.role}</td>

            <td>
              <select
                value={job.status}
                onChange={(e) =>
                  onStatusChange(job._id, e.target.value)
                }
              >
                <option>Applied</option>
                <option>Interviewed</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </td>

            <td>
              <button onClick={() => onDeleteClick(job._id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


export default TableView;