import { AuthRequest } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import z from "zod";
import { Response } from "express";

const paginationSchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
});

export const getHistoryRequests = async (req: AuthRequest, res: Response) => {
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
        user: { select: { name: true, image: true } },
      },
    }),
    prisma.request.count({ where: { workspaceId } }),
  ]);

  return res.json({
    success: true,
    data: requests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const deleteHistoryItem = async (
  req: AuthRequest<{ workspaceId: string; requestId: string }>,
  res: Response
) => {
  const { workspaceId, requestId } = req.params;

  await prisma.request.delete({
    where: { id: Number(requestId), workspaceId },
  });

  return res.status(204).send();
};

export const clearHistory = async (req: AuthRequest, res: Response) => {
  const workspaceId = req.workspace!.id;

  await prisma.request.deleteMany({
    where: { workspaceId },
  });

  return res.status(204).send();
};
