import { prisma } from "@/lib/prisma.js";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import z from "zod";

import { AppError } from "@/utils/AppError.js";
import { Role } from "@generated/prisma/client.js";

const router = Router();
router.use(verify);

function maskVariablesByRole(variables: any[], role: Role | undefined) {
  return variables.map((v) => {
    if (v.secret) {
      if (role === Role.OWNER) return v;
      if (role === Role.ADMIN) return { ...v, value: "****" };

      const { value, ...rest } = v;
      return rest;
    }
    return v;
  });
}

async function getEnvironmentOrThrow(envId: string, workspaceId: string) {
  const env = await prisma.environment.findFirst({
    where: { id: envId, workspaceId },
    include: { environmentVariables: true },
  });
  if (!env) throw new AppError(404, "Environment not found in this workspace");
  return env;
}

const envSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

router.post(
  "/:workspaceId/environments",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(
    async (req: AuthRequest<{ workspaceId: string }, {}, z.infer<typeof envSchema>>, res) => {
      const { name } = envSchema.parse(req.body);
      const workspaceId = req.workspace!.id;

      const newEnvironment = await prisma.environment.create({
        data: {
          name,
          workspaceId,
        },
      });

      return res.status(201).json({ success: true, newEnvironment });
    }
  )
);

router.get(
  "/:workspaceId/environments",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(async (req: AuthRequest, res) => {
    const workspaceId = req.workspace!.id;

    const environments = await prisma.environment.findMany({
      where: { workspaceId },
      include: { environmentVariables: true },
    });

    const responseData = environments.map((env) => ({
      ...env,
      environmentVariables: maskVariablesByRole(env.environmentVariables, req.userRole),
    }));

    return res.status(200).json({ success: true, responseData });
  })
);

router.get(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(async (req: AuthRequest<{ workspaceId: string; envId: string }>, res) => {
    const { envId, workspaceId } = req.params;

    const env = await getEnvironmentOrThrow(envId, workspaceId);

    const maskedEnv = {
      ...env,
      environmentVariables: maskVariablesByRole(env.environmentVariables, req.userRole),
    };

    return res.status(200).json({ success: true, environment: maskedEnv });
  })
);

const envNameSchema = z.object({ name: z.string().min(1) });
type envNameType = z.infer<typeof envNameSchema>;
router.put(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest<{ envId: string }, {}, envNameType>, res) => {
    const { envId } = req.params;

    await getEnvironmentOrThrow(envId, req.workspace!.id);

    const { name } = envNameSchema.parse(req.body);

    await prisma.environment.update({
      where: { id: envId },
      data: { name },
    });
    return res.status(200).json({ success: true });
  })
);

router.delete(
  "/:workspaceId/environments/:envId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest<{ envId: string }>, res) => {
    const { envId } = req.params;
    await getEnvironmentOrThrow(envId, req.workspace!.id);

    await prisma.environment.delete({ where: { id: envId } });
    res.status(204).send();
  })
);

const variableSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  secret: z.boolean().default(false),
});

const updateVariableSchema = z
  .object({
    key: z.string().min(1).optional(),
    value: z.string().optional(),
    secret: z.boolean().optional(),
  })
  .refine(
    (data) => data.key !== undefined || data.value !== undefined || data.secret !== undefined,
    {
      message: "At least one field must be provided for update",
    }
  );

router.post(
  "/:workspaceId/environments/:envId/variables",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(
    async (req: AuthRequest<{ envId: string }, {}, z.infer<typeof variableSchema>>, res) => {
      const { envId } = req.params;
      await getEnvironmentOrThrow(envId, req.workspace!.id);

      const body = variableSchema.parse(req.body);

      const newVar = await prisma.environmentVariable.create({
        data: {
          ...body,
          environmentId: envId,
        },
      });

      res.status(201).json({ success: true, variable: newVar });
    }
  )
);

router.put(
  "/:workspaceId/environments/:envId/variables/:varId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(
    async (
      req: AuthRequest<{ envId: string; varId: string }, {}, z.infer<typeof updateVariableSchema>>,
      res
    ) => {
      const { envId, varId } = req.params;
      const workspaceId = req.workspace!.id;

      await getEnvironmentOrThrow(envId, workspaceId);

      const prevVar = await prisma.environmentVariable.findFirst({
        where: { id: Number(varId), environmentId: envId },
      });
      if (!prevVar) throw new AppError(404, "Variable not found in this environment");

      const body = updateVariableSchema.parse(req.body);

      const updateData = Object.fromEntries(
        Object.entries(body).filter(([, val]) => val !== undefined)
      );

      const updatedVar = await prisma.environmentVariable.update({
        where: { id: Number(varId) },
        data: updateData,
      });

      res.json({ success: true, variable: updatedVar });
    }
  )
);

router.delete(
  "/:workspaceId/environments/:envId/variables/:varId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest<{ envId: string; varId: string }>, res) => {
    const { envId, varId } = req.params;
    const workspaceId = req.workspace!.id;

    await getEnvironmentOrThrow(envId, workspaceId);

    const prevVar = await prisma.environmentVariable.findFirst({
      where: { id: Number(varId), environmentId: envId },
    });
    if (!prevVar) throw new AppError(404, "Variable not found in this environment");

    await prisma.environmentVariable.delete({ where: { id: Number(varId) } });
    res.status(204).send();
  })
);

export { router as environmentsRouter };
