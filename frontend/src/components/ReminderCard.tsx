import { type Reminder } from "../types/reminder";
import { getReminders,cancelReminder } from "../services/reminderService";
import { useEffect } from "react";
import { useState } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";

interface Props {
  reminder: Reminder;
  onCancel: () => void;
}

export default function ReminderCard({ reminder, onCancel }: Props) {
  const [countdown, setCountdown] = useState<string>("");

  const handleCancel = async () => {
    await cancelReminder(reminder._id);
    onCancel();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(reminder.reminderDate).getTime() - Date.now();

      if (diff <= 0) {
        setCountdown("Sending soon...");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown(`${days} days ${hours} hours remaining`);
      }
    }, 1000); // Update countdown every second

    // Clean up the interval when the component unmounts or reminderDate changes
    return () => clearInterval(interval);
  }, [reminder.reminderDate]);


  // snooze reminder
  const snooze=async(days:number)=>{
    const newDate=new Date();
    newDate.setDate(newDate.getDate()+days);

    await api.patch(`/reminders/${reminder._id}/snooze`,{
      newDate,
    });

    toast.success("Reminder snoozed");
    getReminders();
  }
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 border">
      {/* Check if reminder.job exists */}
      {reminder.job ? (
        <>
          <h3 className="text-lg font-semibold">
            {reminder.job.role}
          </h3>
          <p className="text-gray-500">
            {reminder.job.companyName}
          </p>
        </>
      ) : (
        <p className="text-red-600">Job not found (it may have been deleted)</p>
      )}

      <p className="mt-2 text-sm">
        Date: {new Date(reminder.reminderDate).toLocaleString()}
      </p>

      <p className="text-sm text-blue-600 mt-1">
        {reminder.status === "scheduled" && countdown}
      </p>

      <span
        className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
          reminder.status === "scheduled"
            ? "bg-yellow-100 text-yellow-700"
            : reminder.status === "sent"
            ? "bg-green-100 text-green-700"
            : reminder.status === "failed"
            ? "bg-red-100 text-red-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {reminder.status}
      </span>

      {reminder.status === "scheduled" && (
        <button
          onClick={handleCancel}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition"
        >
          Cancel Reminder
        </button>
      )}
      <button onClick={()=>snooze(1)}>+1 Day</button>
      <button onClick={()=>snooze(3)}>+3 Days</button>

    </div>
  );
}
