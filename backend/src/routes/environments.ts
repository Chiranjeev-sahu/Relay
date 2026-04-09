import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import {
  createEnvironment,
  getEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
  createEnvVariable,
  updateEnvVariable,
  deleteEnvVariable,
} from "@/controllers/environments.controller.js";

const router = Router();
router.use(verify);

router.post(
  "/:workspaceId/environments",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(createEnvironment)
);
router.get(
  "/:workspaceId/environments",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(getEnvironments)
);
router.get(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(getEnvironmentById)
);
router.put(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(updateEnvironment)
);
router.delete(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(deleteEnvironment)
);

router.post(
  "/:workspaceId/environments/:envId/variables",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(createEnvVariable)
);
router.put(
  "/:workspaceId/environments/:envId/variables/:varId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(updateEnvVariable)
);
router.delete(
  "/:workspaceId/environments/:envId/variables/:varId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(deleteEnvVariable)
);

export { router as environmentsRouter };
