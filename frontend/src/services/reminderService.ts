import api from "../lib/axios";


export const getReminders=()=>
    api.get("/api/reminders/");
export const cancelReminder=(id:string)=>
    api.delete(`/api/reminders/${id}/`);

export const createReminder=(data:{
    jobId:string;
    reminderDate:string;
})=>api.post("/api/reminders/",data);
