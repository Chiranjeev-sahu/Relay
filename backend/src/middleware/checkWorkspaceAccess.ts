import { Role } from "@generated/prisma/enums.js";
import { AuthRequest } from "./verify.js";
import { NextFunction, Response } from "express";
import { prisma } from "@/lib/prisma.js";
import { AppError } from "@/utils/AppError.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export const checkWorkspaceAccess = (minimumRole: Role) => {
  return asyncHandler(
    async (req: AuthRequest<{ workspaceId: string }>, res: Response, next: NextFunction) => {
      const userId = req.userId;
      if (!userId) {
        next(new AppError(401, "Unauthorized", []));
        return;
      }
      const workspaceId = req.params.workspaceId;
      const userData = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspaceId,
            userId: userId,
          },
        },
        include: { workspace: true },
      });
      if (!userData) return res.status(403).json({ message: "Not a member" });

      if (ROLE_RANK[userData.role] < ROLE_RANK[minimumRole]) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      req.workspace = userData.workspace;
      req.userRole = userData.role;
      next();
      return;
    }
  );
};
