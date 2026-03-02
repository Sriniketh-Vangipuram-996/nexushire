import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    requestId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({actorId:1,createdAt:-1});
auditLogSchema.index({action:1,createdAt:-1});
auditLogSchema.index({createdAt:-1});

/**
 * TTL Index (Auto Expire after 90 Days
 */

auditLogSchema.index({
  createdAt:1
},
{
  expireAfterSeconds:60*60*24*90
});
export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);