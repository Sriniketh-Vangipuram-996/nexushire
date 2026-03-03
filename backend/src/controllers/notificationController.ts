import Notification from "../common/models/Notification";
import {Request,Response} from "express";

export const getNotifications = async (req:Request, res:Response) => {
  const notifications = await Notification.find({
    user: req.user?.userId,
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

export const markAsRead = async (req:Request, res:Response) => {
  const {id}=req.params;

  const notification=await Notification.findOneAndUpdate({
    _id:id,
    user:req.user?.userId
  },
  {isRead:true},
  {new:true}
   );

   if(!notification)return res.status(404).json({error:"Notification not found."});
  res.json(notification);
};

export const getUnreadCount=async(req:Request,res:Response)=>{
  const count=await Notification.countDocuments({
    user:req.user!.userId,
    isRead:false,
  });

  res.json({count});
}

export const markAllRead = async (req: Request, res: Response) => {
  if(!req.user)return res.status(401).json({error:"Unauthorized"});

  const userId=req.user.userId;
  await Notification.updateMany(
    { user: userId, isRead: false },
    { $set:{isRead: true} }
  );

  res.json({ success: true, message: "All notifications marked as read." });
};