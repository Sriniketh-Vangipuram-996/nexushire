import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket=(userId:string,userRole:string)=>{
    if(!socket){
        socket=io(import.meta.env.VITE_API_URL,{
            transports:["websocket"],
            auth:{ userId,userRole },
            autoConnect:true,
            withCredentials:true,
        });

        socket.on("connect",()=>{
            console.log("Socket connected with ID:",socket!.id);
        });

        socket.on("connect_error",(err)=>{
            console.log("socket connection error:",err);
        });
    }
    return socket;
};

export const getSocket=()=>socket;

export const disconnectSocket=()=>{
    if(socket){
        socket.disconnect();
        socket=null;
    }
};