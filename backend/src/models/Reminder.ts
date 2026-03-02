import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  email: string;
  reminderDate: Date;
  status: "scheduled" | "sent" | "failed" | "cancelled";
  bullJobId?: string|null;
  createdAt: Date;
  sentAt:Date;
  failedAt?:Date|null;
  failureReason?:string|null;
  isConverted:{
    type:Boolean,
    default:false,
  },
  convertedAt:Date;
  retryCount:number;
  bounceLog:string;
  lastTriedAt:Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "sent", "failed", "cancelled"],
      default: "scheduled",
    },
    bullJobId: {
      type: String,
      required: true,
      default:null,
    },
    sentAt:Date,
    failedAt:Date,
    failureReason:String,
    isConverted:{type:Boolean,default:false},
    convertedAt:Date,
    retryCount:{
      type:Number,
      default:0,
    },
    bounceLog:{
      type:String,
    },
    lastTriedAt:Date,
  },
  { timestamps: true }
);

/**
 * Compound Schema
 * used for :
 * ->Dashboard fetch
 * ->filtering by status
 * ->sorting by newest first
 */

 reminderSchema.index({
  user:1,
  status:1,
  createdAt:-1,
 },
{
  partialFilterExpression:{status:"scheduled"},
});

export default mongoose.model<IReminder>("Reminder", reminderSchema);
