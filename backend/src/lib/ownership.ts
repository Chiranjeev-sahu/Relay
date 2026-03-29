import { prisma } from "@/lib/prisma.js";
import { AppError } from "@/utils/AppError.js";

export async function getCollectionOrThrow(collectionId: string | number, workspaceId: string) {
  const id = Number(collectionId);
  if (Number.isNaN(id)) throw new AppError(400, "Invalid collection ID");

  const collection = await prisma.collection.findFirst({
    where: { id, workspaceId },
  });
  if (!collection) throw new AppError(404, "Collection not found in this workspace");
  return collection;
}

export async function getEnvironmentOrThrow(envId: string, workspaceId: string) {
  const env = await prisma.environment.findFirst({
    where: { id: envId, workspaceId },
    include: { environmentVariables: true },
  });
  if (!env) throw new AppError(404, "Environment not found in this workspace");
  return env;
}
