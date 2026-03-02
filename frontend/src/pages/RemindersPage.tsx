import { useEffect, useState } from "react";
import { getReminders } from "../services/reminderService";
import ReminderCard from "../components/ReminderCard";
import type { Reminder } from "../types/reminder";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = async () => {
    const res = await getReminders();
    setReminders(res.data);
  };

  useEffect(() => {
    const loadData=async()=>{
        await fetchReminders();
    }
    loadData();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Reminder History
      </h1>

      {reminders.length === 0 ? (
        <p className="text-gray-500">
          No reminders yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders.map((r) => (
            <ReminderCard
              key={r._id}
              reminder={r}
              onCancel={fetchReminders}
            />
          ))}
        </div>
      )}
    </div>
  );
}
