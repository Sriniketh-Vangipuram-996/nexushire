import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNotificationStore } from "../store/notificationStore";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const  NotificationsPage=()=>{
    const[notifications,setNotifications]=useState<Notification[]>([]);
    const resetUnreadCount=useNotificationStore((s)=>s.resetUnreadCount);

    useEffect(()=>{
        const loadData=async()=>{
            await api.patch("/notifications/mark-all-read");
            resetUnreadCount();

            const res=await api.get("/notifications");
            setNotifications(res.data);
        };
        loadData();
    },[]); //Run only on Mount

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">
                Notifications
            </h1>

            {notifications.map((n)=>(
                <div 
                 key={n._id}
                 className={`bg-white p-4 rounded-xl shadow mb-3 ${n.isRead? "opacity-60":""}`}
                 >
                    <p>{n.message}</p>
                    <small className="text-gray-500">{new Date(n.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}


export default NotificationsPage;