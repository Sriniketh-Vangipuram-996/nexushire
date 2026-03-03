import { create } from "zustand";
import api from "../lib/axios";


interface NotificationStore{
    unreadCount:number,
    setUnreadCount:(count:number)=>void;
    fetchUnreadCount:()=>Promise<void>;
    resetUnreadCount:()=>void;
}

export const useNotificationStore=create<NotificationStore>((set)=>({
    unreadCount:0,
    setUnreadCount:(count)=>set({unreadCount:count}),

    fetchUnreadCount:async()=>{
        try{
            const res=await api.get("/notifications/unread-count");
            set({unreadCount:res.data.count});
        }
        catch(err){
            console.error("Failed to fetch unread count",err);
        }

    },
    resetUnreadCount:()=>set({unreadCount:0}),
}));