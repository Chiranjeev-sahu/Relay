import { Router } from "express";
import { prisma } from "@/lib/prisma.js";
import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import z from "zod";

const router = Router();
router.use(verify);

const paginationSchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
});

router.get(
  "/:workspaceId/requests",
  checkWorkspaceAccess("VIEWER"),
  asyncHandler(async (req: AuthRequest, res) => {
    const workspaceId = req.workspace!.id;

    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
      }),
      prisma.request.count({ where: { workspaceId } }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

router.delete(
  "/:workspaceId/requests/clear",
  checkWorkspaceAccess("ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const workspaceId = req.workspace!.id;

    await prisma.request.deleteMany({
      where: { workspaceId },
    });

    res.status(204).send();
  })
);

export { router as workspaceRequestsRouter };
