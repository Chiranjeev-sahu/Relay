import { AuthRequest } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import z from "zod";
import { Response } from "express";
import { AppError } from "@/utils/AppError.js";

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});

export const createCollection = async (req: AuthRequest, res: Response) => {
  const { name, description } = collectionSchema.parse(req.body);

  const newCollection = await prisma.collection.create({
    data: {
      name,
      description: description ?? null,
      workspaceId: req.workspace!.id,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Collection created successfully",
    collection: newCollection,
  });
};

export const getCollections = async (req: AuthRequest, res: Response) => {
  const workspaceId = req.workspace!.id;

  const collections = await prisma.collection.findMany({
    where: { workspaceId },
  });

  return res.status(200).json({ success: true, collections });
};

export const getCollectionById = async (
  req: AuthRequest<{ collectionId: string; workspaceId: string }>,
  res: Response
) => {
  const { collectionId, workspaceId } = req.params;

  const collection = await prisma.collection.findUnique({
    where: {
      id_workspaceId: { id: Number(collectionId), workspaceId },
    },
    include: { collectionRequests: true },
  });

  if (!collection) {
    throw new AppError(404, "Collection not found in this workspace", []);
  }

  const { collectionRequests, ...collectionData } = collection;

  return res.status(200).json({
    success: true,
    collection: collectionData,
    allRequests: collectionRequests,
  });
};

const updateBodySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one of name or description must be provided",
  });

export const updateCollection = async (
  req: AuthRequest<
    { collectionId: string; workspaceId: string },
    {},
    z.infer<typeof updateBodySchema>
  >,
  res: Response
) => {
  const { collectionId, workspaceId } = req.params;
  const data = updateBodySchema.parse(req.body);

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, val]) => val !== undefined)
  );

  const updated = await prisma.collection.update({
    where: {
      id_workspaceId: { id: Number(collectionId), workspaceId },
    },
    data: updateData,
  });

  return res.status(200).json({ success: true, collection: updated });
};

export const deleteCollection = async (
  req: AuthRequest<{ collectionId: string; workspaceId: string }>,
  res: Response
) => {
  const { collectionId, workspaceId } = req.params;

  await prisma.collection.delete({
    where: {
      id_workspaceId: { id: Number(collectionId), workspaceId },
    },
  });

  return res.status(200).json({ message: "Deletion complete" });
};
