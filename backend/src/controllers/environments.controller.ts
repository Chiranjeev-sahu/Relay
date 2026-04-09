import { AuthRequest } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import z from "zod";
import { Role } from "@generated/prisma/client.js";
import { Response } from "express";

function maskVariablesByRole(variables: any[], role: Role | undefined) {
  return variables.map((v) => {
    if (v.secret && role !== "ADMIN" && role !== "OWNER") {
      return { ...v, value: "*********" };
    }
    return v;
  });
}

const envSchema = z.object({
  name: z.string().min(1),
});

export const createEnvironment = async (
  req: AuthRequest<{ workspaceId: string }, {}, z.infer<typeof envSchema>>,
  res: Response
) => {
  const { name } = envSchema.parse(req.body);
  const workspaceId = req.workspace!.id;

  const newEnvironment = await prisma.environment.create({
    data: { name, workspaceId },
  });

  return res.status(201).json({ success: true, newEnvironment });
};

export const getEnvironments = async (req: AuthRequest, res: Response) => {
  const workspaceId = req.workspace!.id;

  const environments = await prisma.environment.findMany({
    where: { workspaceId },
    include: { environmentVariables: true },
  });

  // Mask sensitive variables for viewers
  const parsedEnvs = environments.map((env) => ({
    ...env,
    environmentVariables: maskVariablesByRole(env.environmentVariables, req.userRole),
  }));

  return res.status(200).json({ success: true, environments: parsedEnvs });
};

export const getEnvironmentById = async (
  req: AuthRequest<{ workspaceId: string; envId: string }>,
  res: Response
) => {
  const { envId, workspaceId } = req.params;
  
  const env = await prisma.environment.findUnique({
    where: { id_workspaceId: { id: envId, workspaceId } },
    include: { environmentVariables: true },
  });

  // P2025 doesn't trigger on findUnique, so we still manually throw here if null
  if (!env) {
    return res.status(404).json({ success: false, message: "Environment not found" });
  }

  env.environmentVariables = maskVariablesByRole(env.environmentVariables, req.userRole) as any;

  return res.status(200).json({ success: true, environment: env });
};

const envNameSchema = z.object({
  name: z.string().min(1).optional(),
});

export const updateEnvironment = async (
  req: AuthRequest<{ workspaceId: string; envId: string }, {}, z.infer<typeof envNameSchema>>,
  res: Response
) => {
  const { envId, workspaceId } = req.params;
  const { name } = envNameSchema.parse(req.body);

  if (!name) return res.status(400).json({ success: false, message: "Nothing to update" });

  const updated = await prisma.environment.update({
    where: { id_workspaceId: { id: envId, workspaceId } },
    data: { name },
  });

  return res.status(200).json({ success: true, environment: updated });
};

export const deleteEnvironment = async (
  req: AuthRequest<{ workspaceId: string; envId: string }>, 
  res: Response
) => {
  const { envId, workspaceId } = req.params;

  await prisma.environment.delete({
    where: { id_workspaceId: { id: envId, workspaceId } },
  });

  return res.status(204).send();
};

const variableSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  secret: z.boolean().default(false),
  description: z.string().nullish(),
});

export const createEnvVariable = async (
  req: AuthRequest<{ workspaceId: string; envId: string }, {}, z.infer<typeof variableSchema>>,
  res: Response
) => {
  const { envId, workspaceId } = req.params;
  const body = variableSchema.parse(req.body);

  const newVar = await prisma.environmentVariable.create({
    data: {
      key: body.key,
      value: body.value,
      secret: body.secret,
      description: body.description ?? null,
      environment: {
        connect: { id_workspaceId: { id: envId, workspaceId } },
      },
    },
  });

  return res.status(201).json({ success: true, variable: newVar });
};

const updateVariableSchema = z
  .object({
    key: z.string().min(1).optional(),
    value: z.string().optional(),
    description: z.string().nullish(),
    secret: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.key !== undefined ||
      data.value !== undefined ||
      data.secret !== undefined ||
      data.description !== undefined,
    { message: "At least one field must be provided for update" }
  );

export const updateEnvVariable = async (
  req: AuthRequest<{ workspaceId: string; envId: string; varId: string }, {}, z.infer<typeof updateVariableSchema>>,
  res: Response
) => {
  const { envId, varId, workspaceId } = req.params;
  const body = updateVariableSchema.parse(req.body);

  const updateData = Object.fromEntries(
    Object.entries(body).filter(([, val]) => val !== undefined)
  );

  const updatedEnv = await prisma.environment.update({
    where: { id_workspaceId: { id: envId, workspaceId } },
    data: {
      environmentVariables: {
        update: {
          where: { id_environmentId: { id: Number(varId), environmentId: envId } },
          data: updateData,
        },
      },
    },
    include: {
      environmentVariables: { where: { id: Number(varId) } }, // Returns the one we updated
    },
  });

  return res.status(200).json({ success: true, variable: updatedEnv.environmentVariables[0] });
};

export const deleteEnvVariable = async (
  req: AuthRequest<{ workspaceId: string; envId: string; varId: string }>,
  res: Response
) => {
  const { envId, varId, workspaceId } = req.params;

  await prisma.environment.update({
    where: { id_workspaceId: { id: envId, workspaceId } },
    data: {
      environmentVariables: {
        delete: { id_environmentId: { id: Number(varId), environmentId: envId } },
      },
    },
  });

  return res.status(204).send();
};
