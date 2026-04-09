import { AuthRequest } from "@/middleware/verify.js";
import { prisma } from "@/lib/prisma.js";
import { z } from "zod";
import { Response } from "express";
import { createId } from "@paralleldrive/cuid2";
export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    description: m.workspace.description,
    role: m.role,
    inviteCode: m.workspace.inviteCode,
  }));

  return res.status(200).json({ success: true, workspaces });
};

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  const { name, description } = createWorkspaceSchema.parse(req.body);
  const userId = req.userId!;

  const newWorkspace = await prisma.workspace.create({
    data: {
      name,
      description: description ?? null,
      workspaceMembers: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  return res.status(201).json({ success: true, workspace: newWorkspace });
};

const joinSchema = z.object({ inviteCode: z.string() });

export const joinWorkspace = async (req: AuthRequest, res: Response) => {
  const { inviteCode } = joinSchema.parse(req.body);
  const userId = req.userId!;

  const workspace = await prisma.workspace.findUnique({
    where: { inviteCode },
  });

  if (!workspace) {
    return res.status(404).json({ success: false, message: "Invalid invite code." });
  }

  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: workspace.id, userId },
    },
  });

  if (existingMember) {
    return res.status(400).json({ success: false, message: "Already a member." });
  }

  await prisma.workspaceMember.create({
    data: {
      userId,
      workspaceId: workspace.id,
      role: "MEMBER",
    },
  });

  return res.status(200).json({
    success: true,
    message: "Joined workspace successfully.",
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
  });
};

export const getMembers = async (req: AuthRequest<{ workspaceId: string }>, res: Response) => {
  const { workspaceId } = req.params;

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const formatted = members.map((m) => ({
    memberId: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  return res.status(200).json({ success: true, members: formatted });
};

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export const updateMemberRole = async (
  req: AuthRequest<{ workspaceId: string; memberId: string }>,
  res: Response
) => {
  const { workspaceId, memberId } = req.params;
  const { role } = updateRoleSchema.parse(req.body);

  const targetMember = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.workspaceId !== workspaceId) {
    return res.status(404).json({ success: false, message: "Member not found." });
  }

  if (targetMember.role === "OWNER") {
    return res.status(403).json({ success: false, message: "Cannot change the role of an OWNER." });
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
  });

  return res.status(200).json({ success: true, updated });
};

export const removeMember = async (
  req: AuthRequest<{ workspaceId: string; memberId: string }>,
  res: Response
) => {
  const { workspaceId, memberId } = req.params;

  const targetMember = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
  });

  if (!targetMember || targetMember.workspaceId !== workspaceId) {
    return res.status(404).json({ success: false, message: "Member not found." });
  }

  if (targetMember.role === "OWNER") {
    return res.status(403).json({ success: false, message: "Cannot remove an OWNER." });
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  return res.status(204).send();
};

export const regenerateInviteCode = async (
  req: AuthRequest<{ workspaceId: string }>,
  res: Response
) => {
  const { workspaceId } = req.params;
  const newInviteCode = createId();
  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { inviteCode: newInviteCode },
  });

  return res.status(200).json({ success: true, inviteCode: updated.inviteCode });
};

export const deleteWorkspace = async (req: AuthRequest<{ workspaceId: string }>, res: Response) => {
  const { workspaceId } = req.params;
  await prisma.workspace.delete({ where: { id: workspaceId } });
  return res.status(204).send();
};
