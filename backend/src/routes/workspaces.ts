import { Router } from "express";
import { verify } from "@/middleware/verify.js";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  getWorkspaces,
  createWorkspace,
  joinWorkspace,
  getMembers,
  updateMemberRole,
  removeMember,
  regenerateInviteCode,
  deleteWorkspace,
} from "@/controllers/workspaces.controller.js";

const router = Router();
router.use(verify);

router.get("/", asyncHandler(getWorkspaces));
router.post("/", asyncHandler(createWorkspace));
router.post("/join", asyncHandler(joinWorkspace));

router.get("/:workspaceId/members", checkWorkspaceAccess("VIEWER"), asyncHandler(getMembers));
router.patch(
  "/:workspaceId/members/:memberId/role",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(updateMemberRole)
);
router.delete(
  "/:workspaceId/members/:memberId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(removeMember)
);

router.post(
  "/:workspaceId/invite/regenerate",
  checkWorkspaceAccess("OWNER"),
  asyncHandler(regenerateInviteCode)
);
router.delete("/:workspaceId", checkWorkspaceAccess("OWNER"), asyncHandler(deleteWorkspace));

export { router as workspacesRouter };
