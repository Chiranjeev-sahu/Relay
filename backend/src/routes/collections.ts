import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "@/controllers/collections.controller.js";

const router = Router();
router.use(verify);

router.post(
  "/:workspaceId/collections",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(createCollection)
);
router.get(
  "/:workspaceId/collections",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(getCollections)
);
router.get(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(getCollectionById)
);
router.put(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(updateCollection)
);
router.delete(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(deleteCollection)
);

export { router as collectionsRouter };
