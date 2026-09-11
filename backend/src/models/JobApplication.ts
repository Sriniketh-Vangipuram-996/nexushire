import mongoose, {Schema,Document} from "mongoose";

export interface IJobApplication extends Document{
    companyName:string;
    role:string;
    description:string;
    status:string;
    appliedDate:Date;
    notes?:string;
    user:mongoose.Types.ObjectId;
    resume:mongoose.Types.ObjectId | null;
    comparisons?: {
        resume: any; // will be populated
        score: number;
        strengths: string[];
        missingSkills: string[];
        suggestions: string[];
        analyzedAt: Date;
    }[];

    
}

const JobApplicationSchema=new Schema<IJobApplication>(
    {
        companyName:{
            type:String,
            required:true,
        },

        role:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        status:{
            type:String,
            enum:["Applied","Interviewed","Rejected","Offer"],
            default:"Applied",
        },
        appliedDate:{
            type:Date,
            default:Date.now,
        },
        notes:{
            type:String,
        },

        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        resume:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Resume",
            default:null,
        },
        comparisons: [
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    strengths: [String],
    missingSkills: [String],
    suggestions: [String],
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    },
    {timestamps:true}
);

export default mongoose.model<IJobApplication>(
    "JobApplication",
    JobApplicationSchema
);