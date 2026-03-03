import api from "../lib/axios";


export const getReminders=()=>
    api.get("/reminders/");
export const cancelReminder=(id:string)=>
    api.delete(`/reminders/${id}/`);

export const createReminder=(data:{
    jobId:string;
    reminderDate:string;
})=>api.post("/reminders/",data);
