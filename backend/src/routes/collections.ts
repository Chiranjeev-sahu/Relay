import { prisma } from "@/lib/prisma.js";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { AppError } from "@/utils/AppError.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { Router } from "express";
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
      workspace: newCollection,
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
  asyncHandler(async (req: AuthRequest<{ collectionId: string }>, res) => {
    const { collectionId } = req.params;
    const id = Number(collectionId);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid collection ID");

    const allRequests = await prisma.collectionRequest.findMany({
      where: { collectionId: id },
    });

    return res.status(200).json({ success: true, allRequests });
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
  asyncHandler(async (req: AuthRequest<{ collectionId: string }, {}, UpdateBodyType>, res) => {
    const { collectionId } = req.params;
    const id = Number(collectionId);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid collection ID");

    const data = updateBodySchema.parse(req.body);
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, val]) => val !== undefined)
    );
    const updated = await prisma.collection.update({
      where: { id },
      data: updateData,
    });
    return res.status(200).json({ success: true, collection: updated });
  })
);

router.delete(
  "/:workspaceId/collections/:collectionId",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest<{ collectionId: string }>, res) => {
    const { collectionId } = req.params;
    const id = Number(collectionId);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid collection ID");

    await prisma.collection.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Deletion complete" });
  })
);

export { router as collectionsRouter };
