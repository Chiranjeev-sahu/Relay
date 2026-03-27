import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import { AppError } from "@/utils/AppError.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import z from "zod";

const router = Router();
router.use(verify);

async function getCollectionOrThrow(collectionId: string, workspaceId: string) {
  const collection = await prisma.collection.findFirst({
    where: { id: Number(collectionId), workspaceId },
  });
  if (!collection) throw new AppError(404, "Collection not found in this workspace");
  return collection;
}

const collectionReqeustBody = z.object({
  name: z.string().min(1),
  method: z.string().min(1),
  url: z.string().min(1),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.json().optional(),
});

type collectionRequestType = z.infer<typeof collectionReqeustBody>;

router.post(
  "/:workspaceId/collections/:collectionId/requests",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(
    async (
      req: AuthRequest<{ workspaceId: string; collectionId: string }, {}, collectionRequestType>,
      res
    ) => {
      const { workspaceId, collectionId } = req.params;
      const body = collectionReqeustBody.parse(req.body);

      const collection = await getCollectionOrThrow(collectionId, workspaceId);

      const newRequest = await prisma.collectionRequest.create({
        data: {
          name: body.name,
          method: body.method,
          url: body.url,
          headers: body.headers ?? {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: body.body as any,
          collectionId: collection.id,
          createdBy: req.userId ?? null,
        },
      });

      res.status(201).json({ success: true, newRequest });
    }
  )
);

const updateRequestBody = z
  .object({
    name: z.string().min(1).optional(),
    method: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.json().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.method !== undefined ||
      data.url !== undefined ||
      data.headers !== undefined ||
      data.body !== undefined,
    { message: "At least one of data fields must be provided" }
  );

type updateRequestType = z.infer<typeof updateRequestBody>;
router.put(
  "/:workspaceId/collections/:collectionId/requests/:requestId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(
    async (
      req: AuthRequest<
        { workspaceId: string; collectionId: string; requestId: string },
        {},
        updateRequestType
      >,
      res
    ) => {
      const { collectionId, requestId } = req.params;

      await getCollectionOrThrow(collectionId, req.params.workspaceId);

      const prevCollectionRequest = await prisma.collectionRequest.findFirst({
        where: {
          id: Number(requestId),
          collectionId: Number(collectionId),
        },
      });

      if (!prevCollectionRequest)
        throw new AppError(404, "CollectionRequest not found in this collection");

      const data = updateRequestBody.parse(req.body);

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([, val]) => val !== undefined)
      );

      const newCollectionRequest = await prisma.collectionRequest.update({
        where: { id: Number(requestId) },
        data: updateData,
      });

      return res.status(200).json({ success: "true", newCollectionRequest });
    }
  )
);

router.delete(
  "/:workspaceId/collections/:collectionId/requests/:requestId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(
    async (
      req: AuthRequest<{ workspaceId: string; collectionId: string; requestId: string }>,
      res
    ) => {
      const { collectionId, requestId } = req.params;

      await getCollectionOrThrow(collectionId, req.params.workspaceId);

      const prevCollectionRequest = await prisma.collectionRequest.findFirst({
        where: { id: Number(requestId), collectionId: Number(collectionId) },
      });
      if (!prevCollectionRequest)
        throw new AppError(404, "CollectionRequest not found in this collection");

      await prisma.collectionRequest.delete({ where: { id: Number(requestId) } });

      res.status(204).send();
    }
  )
);
export { router as collectionRequestRouter };
