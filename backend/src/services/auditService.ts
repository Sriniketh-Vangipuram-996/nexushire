import AuditLog from "../common/models/AuditLog";

interface AuditParams {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export async function createAuditLog(params: AuditParams) {
  await AuditLog.create(params);
}