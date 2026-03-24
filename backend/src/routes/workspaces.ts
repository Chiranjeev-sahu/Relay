import { checkWorkspaceAccess } from "@/middleware/checkWorkspaceAccess.js";
import { AuthRequest, verify } from "@/middleware/verify.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { z } from "zod";
import { Router } from "express";
import { AppError } from "@/utils/AppError.js";
import { prisma } from "@/lib/prisma.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();
router.use(verify);

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});
type CreateWorkspaceBody = z.infer<typeof createWorkspaceSchema>;
router.post(
  "/",
  asyncHandler(async (req: AuthRequest<{}, {}, CreateWorkspaceBody>, res) => {
    const { name, description } = createWorkspaceSchema.parse(req.body);
    const userId = req.userId!;

    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        description: description ?? null,
        workspaceMembers: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace: newWorkspace,
    });
  })
);

const joinWorkspaceSchema = z.object({
  inviteCode: z.cuid(),
});
type joinWorkspaceBody = z.infer<typeof joinWorkspaceSchema>;
router.post(
  "/join",
  asyncHandler(async (req: AuthRequest<{}, {}, joinWorkspaceBody>, res) => {
    const { inviteCode } = joinWorkspaceSchema.parse(req.body);

    const workspace = await prisma.workspace.findUnique({
      where: {
        inviteCode,
      },
    });
    if (!workspace) {
      throw new AppError(404, "Invalid invite code", []);
    }

    const workspaceMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: req.userId!,
        role: "MEMBER",
      },
      include: {
        workspace: true,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Joined Workspace  successfully",
      workspace: workspaceMember.workspace,
    });
  })
);

router.post(
  "/:workspaceId/regenerate-invite",
  checkWorkspaceAccess("OWNER"),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = req.workspace!.id;

    const newInviteCode = createId();
    const updated = await prisma.workspace.update({
      where: { id },
      data: { inviteCode: newInviteCode },
    });
    return res.json({ success: true, inviteCode: updated.inviteCode });
  })
);
const transferOwnerShipSchema = z.object({
  targetUserId: z.string(),
});
type transferOwnerShipBody = z.infer<typeof transferOwnerShipSchema>;

router.post(
  "/:workspaceId/transfer-ownership",
  checkWorkspaceAccess("OWNER"),
  asyncHandler(async (req: AuthRequest<{}, {}, transferOwnerShipBody>, res) => {
    const workspaceId = req.workspace!.id;
    const currentUserId = req.userId!;
    const { targetUserId } = transferOwnerShipSchema.parse(req.body);
    if (currentUserId === targetUserId)
      return res.status(200).json({ message: "You are already the owner" });
    const updatedOwnerWorkspace = await prisma.$transaction([
      prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: currentUserId } },
        data: { role: "ADMIN" },
      }),
      prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
        data: { role: "OWNER" },
      }),
    ]);

    return res.status(200).json({ message: "Ownership updated" });
  })
);
