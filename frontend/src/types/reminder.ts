export interface Reminder{
    _id:string;
    reminderDate:string;
    status:"scheduled"|"sent"|"failed"|"cancelled";
    job:{
        _id:string;
        role:string;
        companyName:string;
    };
}