import {Request,Response,NextFunction} from "express";
import { success, ZodSchema } from "zod";

export const validate=(schema:ZodSchema)=>(req:Request,res:Response,next:NextFunction)=>{
    console.log("REQ BODY RAW:",req.body);
    try{
        req.body=schema.parse(req.body);

        next();
    }
    catch(error:any){
        console.log("ZOD Error:",error);
        return res.status(400).json({
            // success:false,
            from:"validate",
            // message:"Validation failed",
            errors:error.errors,
        });
    }
}