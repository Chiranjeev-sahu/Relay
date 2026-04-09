import { Router } from "express";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import {
  getHistoryRequests,
  deleteHistoryItem,
  clearHistory,
} from "@/controllers/requests.controller.js";

const router = Router();
router.use(verify);

router.get("/:workspaceId/requests", checkWorkspaceAccess("VIEWER"), asyncHandler(getHistoryRequests));

// FLAW FIX: Specific deletion
router.delete("/:workspaceId/requests/:requestId", checkWorkspaceAccess("MEMBER"), asyncHandler(deleteHistoryItem));

router.delete("/:workspaceId/requests/clear", checkWorkspaceAccess("ADMIN"), asyncHandler(clearHistory));

export { router as workspaceRequestsRouter };
