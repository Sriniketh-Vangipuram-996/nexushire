import { AuthRequest } from "../middleware/auth";

export const scopedQuery = (req: AuthRequest) => ({
  tenantId: req.tenantId,
  isDeleted: false,
});