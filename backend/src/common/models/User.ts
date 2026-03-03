import mongoose from "mongoose";

export enum Role{
    ADMIN="ADMIN",
    USER="USER",
}
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },

    passwordHash:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:Object.values(Role),
        default:Role.USER,
    },
    emailVerified:{
        type:Boolean,
        default:false,
    },
    resume:{
        type:String,
        default:null,
    },

    name: { type: String },
    phone: { type: String },
    linkedin: { type: String },
    github: { type: String },
    leetcode: { type: String },
    avatar: { type: String },   
    isActive:{
        type:Boolean,
        default:true,
    },

    isDeleted:{
        type:Boolean,
        default:false,
    },
    tenantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tenant",
        required:true,
    },

},
{timestamps:true}
);

/**
    * unique-index (DB-level enforcement)
*/
userSchema.index({email:1},{unique:true});

export default mongoose.model("User",userSchema);