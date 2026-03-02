import User from "../models/User";

export const uploadResume=async(req:any,res:any)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                error:"No file uploaded"
            });
        }

        const user=await User.findById(req.user.userId,req.tenantId);

        if(!user){
            return res.status(404).json({
                error:"User not found",
            });
        }

        user.resume=req.file.filename;
        await user.save();

        res.json({
            message:"Resume uploaded successfully",
            resume:user.resume,
        });
    }
    catch(err:any){
        res.status(500).json({
            error:err.message || "Upload failed.",
        });
    }
}