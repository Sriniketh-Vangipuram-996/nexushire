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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr className="text-left text-gray-600 dark:text-gray-300">
        <th className="p-4"></th>
        <th className="p-4">Company</th>
        <th className="p-4">Role</th>
        <th className="p-4">Status</th>
        <th className="p-4">Actions</th>
      </tr>
    </thead>

    <tbody>
      {jobs.map((job) => (
        <tr
          key={job._id}
          className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
        >
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
              className="rounded-lg border border-gray-300 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800"
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
              <button onClick={() => onDeleteClick(job._id)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};


export default TableView;