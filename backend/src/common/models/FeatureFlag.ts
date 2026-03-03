import mongoose, {Document,Schema} from "mongoose";

export interface IFeatureFlag extends Document{
    key:string;
    enabled:boolean;
    description?:string;
}

const featureFlagSchema=new Schema<IFeatureFlag>(
    {
        key:{
            type:String,
            required:true,
            unique:true,
        },
        enabled:{
            type:Boolean,
            required:true,
        },
        description:{
            type:String,
        },
    },
    {timestamps:true}
);


export default mongoose.model<IFeatureFlag>(
    "FeatureFlag",
    featureFlagSchema
)