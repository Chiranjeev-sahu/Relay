import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import {
  createCollectionRequest,
  getCollectionRequests,
  updateCollectionRequest,
  deleteCollectionRequest,
} from "@/controllers/collectionRequests.controller.js";

const router = Router();
router.use(verify);

router.post(
  "/:workspaceId/collections/:collectionId/requests",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(createCollectionRequest)
);

// FLAW FIX 3: Route added
router.get(
  "/:workspaceId/collections/:collectionId/requests",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(getCollectionRequests)
);

router.put(
  "/:workspaceId/collections/:collectionId/requests/:requestId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(updateCollectionRequest)
);

router.delete(
  "/:workspaceId/collections/:collectionId/requests/:requestId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(deleteCollectionRequest)
);

export { router as collectionRequestRouter };
