import { type Reminder } from "../types/reminder";
import { cancelReminder } from "../services/reminderService";
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
    onCancel();
  }
  return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-lg font-semibold">
        {reminder.job?.role}
      </h3>

      <p className="text-sm text-gray-500">
        {reminder.job?.companyName}
      </p>
    </div>

    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
      {reminder.status}
    </span>
  </div>

  <div className="mt-4 space-y-2 text-sm text-gray-600">
    <p>📅 {new Date(reminder.reminderDate).toLocaleString()}</p>

    {reminder.status === "scheduled" && (
      <p className="font-medium text-emerald-600">
        ⏳ {countdown}
      </p>
    )}
  </div>

  {reminder.status === "scheduled" && (
    <div className="mt-5 flex gap-2">
      <button
        onClick={() => snooze(1)}
        className="flex-1 rounded-lg border py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        +1 Day
      </button>

      <button
        onClick={() => snooze(3)}
        className="flex-1 rounded-lg border py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        +3 Days
      </button>
    </div>
  )}

  {reminder.status === "scheduled" && (
    <button
      onClick={handleCancel}
      className="mt-3 w-full rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
    >
      Cancel Reminder
    </button>
  )}
</div>
  );
}
