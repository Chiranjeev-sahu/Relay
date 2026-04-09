import { AuthRequest } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import z from "zod";
import { Response } from "express";

const collectionReqeustBody = z.object({
  name: z.string().min(1),
  method: z.string().min(1),
  url: z.string(),
  headers: z.any().optional(),
  body: z.any().optional(),
});

type collectionRequestType = z.infer<typeof collectionReqeustBody>;

export const createCollectionRequest = async (
  req: AuthRequest<{ workspaceId: string; collectionId: string }, {}, collectionRequestType>,
  res: Response
) => {
  const { workspaceId, collectionId } = req.params;
  const body = collectionReqeustBody.parse(req.body);

  const newRequest = await prisma.collectionRequest.create({
    data: {
      name: body.name,
      method: body.method,
      url: body.url,
      headers: body.headers || {},
      body: body.body || null,
      createdBy: req.userId ?? null,
      collection: {
        connect: { id_workspaceId: { id: Number(collectionId), workspaceId } },
      },
    },
  });

  return res.status(201).json({ success: true, newRequest });
};

export const getCollectionRequests = async (
  req: AuthRequest<{ workspaceId: string; collectionId: string }>,
  res: Response
) => {
  const { workspaceId, collectionId } = req.params;

  const requests = await prisma.collectionRequest.findMany({
    where: {
      collectionId: Number(collectionId),
      collection: { workspaceId },
    },
  });

  return res.status(200).json({ success: true, requests });
};

const updateRequestBody = z
  .object({
    name: z.string().optional(),
    method: z.string().optional(),
    url: z.string().optional(),
    headers: z.any().optional(),
    body: z.any().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.method !== undefined ||
      data.url !== undefined ||
      data.headers !== undefined ||
      data.body !== undefined,
    { message: "At least one field is required to update" }
  );

export const updateCollectionRequest = async (
  req: AuthRequest<
    { collectionId: string; requestId: string; workspaceId: string },
    {},
    z.infer<typeof updateRequestBody>
  >,
  res: Response
) => {
  const { collectionId, requestId, workspaceId } = req.params;
  const data = updateRequestBody.parse(req.body);

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, val]) => val !== undefined)
  );

  const updatedCol = await prisma.collection.update({
    where: { id_workspaceId: { id: Number(collectionId), workspaceId } },
    data: {
      collectionRequests: {
        update: {
          where: { id_collectionId: { id: Number(requestId), collectionId: Number(collectionId) } },
          data: { ...updateData, updatedBy: req.userId ?? null },
        },
      },
    },
    include: {
      collectionRequests: { where: { id: Number(requestId) } },
    },
  });

  return res.status(200).json({ success: true, collectionRequest: updatedCol.collectionRequests[0] });
};

export const deleteCollectionRequest = async (
  req: AuthRequest<{ workspaceId: string; collectionId: string; requestId: string }>,
  res: Response
) => {
  const { collectionId, requestId, workspaceId } = req.params;

  await prisma.collection.update({
    where: { id_workspaceId: { id: Number(collectionId), workspaceId } },
    data: {
      collectionRequests: {
        delete: { id_collectionId: { id: Number(requestId), collectionId: Number(collectionId) } },
      },
    },
  });

  return res.status(204).send();
};
