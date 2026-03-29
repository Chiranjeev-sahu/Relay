import { prisma } from "@/lib/prisma.js";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { AppError } from "@/utils/AppError.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
import { getCollectionOrThrow } from "@/lib/ownership.js";
import z from "zod";


const router = Router();
router.use(verify);

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});
type collectionBody = z.infer<typeof collectionSchema>;



router.post(
  "/:workspaceId/collections",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(async (req: AuthRequest<{}, {}, collectionBody>, res) => {
    const { name, description } = collectionSchema.parse(req.body);

    const collectionData = {
      name,
      description: description ?? null,
      workspaceId: req.workspace!.id,
    };

    const newCollection = await prisma.collection.create({
      data: collectionData,
    });

    return res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection: newCollection,
    });
  })
);

router.get(
  "/:workspaceId/collections",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(async (req: AuthRequest, res) => {
    const workspaceId = req.workspace!.id;

    const collections = await prisma.collection.findMany({
      where: { workspaceId },
    });

    return res.status(200).json({ success: true, collections });
  })
);

router.get(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(async (req: AuthRequest<{ collectionId: string; workspaceId: string }>, res) => {
    const { collectionId, workspaceId } = req.params;

    const collection = await getCollectionOrThrow(collectionId, workspaceId);

    const allRequests = await prisma.collectionRequest.findMany({
      where: { collectionId: collection.id },
    });

    return res.status(200).json({ success: true, collection, allRequests });
  })
);

const updateBodySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one of name or description must be provided",
  });

type UpdateBodyType = z.infer<typeof updateBodySchema>;
router.put(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("MEMBER"),
  asyncHandler(
    async (
      req: AuthRequest<{ collectionId: string; workspaceId: string }, {}, UpdateBodyType>,
      res
    ) => {
      const { collectionId, workspaceId } = req.params;

      const collection = await getCollectionOrThrow(collectionId, workspaceId);

      const data = updateBodySchema.parse(req.body);
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([, val]) => val !== undefined)
      );

      const updated = await prisma.collection.update({
        where: { id: collection.id },
        data: updateData,
      });
      return res.status(200).json({ success: true, collection: updated });
    }
  )
);

router.delete(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest<{ collectionId: string; workspaceId: string }>, res) => {
    const { collectionId, workspaceId } = req.params;

    const collection = await getCollectionOrThrow(collectionId, workspaceId);

    await prisma.collection.delete({
      where: { id: collection.id },
    });

    return res.status(200).json({ message: "Deletion complete" });
  })
);

export { router as collectionsRouter };
