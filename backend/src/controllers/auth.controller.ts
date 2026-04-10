import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma.js";
import { generateToken } from "@/lib/token.js";
import { clearAuthCookie, setAuthCookie } from "@/lib/cookie.js";
import { env } from "@/lib/env.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { AuthRequest } from "@/middleware/verify.js";
import { AppError } from "@/utils/AppError.js";
import { Response, Request } from "express";

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new AppError(400, "Email, username and password are required", []);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, username, password: passwordHash },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: "My Workspace",
        description: "Your default workspace",
      },
    });

    await tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    await tx.collection.create({
      data: {
        name: "My APIs",
        workspaceId: workspace.id,
        description: "Your default collection",
      },
    });

    return user;
  });

  const { password: _pw, ...safeUser } = newUser;

  const token = generateToken(newUser.id);
  setAuthCookie(res as any, token); // Types workaround for now

  return res.status(201).json(safeUser);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "Email and password are required", []);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError(401, "Invalid credentials", []);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError(401, "Invalid credentials", []);
  }

  const { password: _pw, ...safeUser } = user;
  const token = generateToken(user.id);
  setAuthCookie(res as any, token);
  return res.status(200).json(safeUser);
};

export const logout = (req: Request, res: Response) => {
  clearAuthCookie(res as any);
  return res.json({ message: "logged out successfully" });
};

export const googleAuth = async (req: Request, res: Response) => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const state = crypto.randomBytes(16).toString("hex");
  const scope = "email profile openid";
  const redirect_uri = env.GOOGLE_REDIRECT_URI;

  const authURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authURL.searchParams.append("client_id", clientId);
  authURL.searchParams.append("redirect_uri", redirect_uri);
  authURL.searchParams.append("response_type", "code");
  authURL.searchParams.append("scope", scope);
  authURL.searchParams.append("state", state);

  return res
    .cookie("state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 10,
    })
    .redirect(authURL.toString());
};

export const googleCallback = async (req: Request, res: Response) => {
  const requestState = typeof req.query.state === "string" ? req.query.state : null;
  const originalState = req.cookies?.state;
  if (requestState !== originalState) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const requestCode = typeof req.query.code === "string" ? req.query.code : null;
  if (!requestCode) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  try {
    const { tokens } = await client.getToken(requestCode);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.email_verified) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    const { sub, email, name, picture } = payload;

    let user;
    const accountExists = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: sub,
        },
      },
      include: { user: true },
    });

    if (!accountExists) {
      const userWithEmail = await prisma.user.findUnique({ where: { email: email } });
      if (userWithEmail) {
        await prisma.account.create({
          data: { userId: userWithEmail.id, provider: "google", providerAccountId: sub },
        });
        user = userWithEmail;
      } else {
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              name: name ?? null,
              image: picture ?? null,
              emailVerified: true,
              accounts: {
                create: { provider: "google", providerAccountId: sub },
              },
            },
          });

          const workspace = await tx.workspace.create({
            data: { name: "My Workspace", description: "Your default workspace" },
          });

          await tx.workspaceMember.create({
            data: { userId: newUser.id, workspaceId: workspace.id, role: "OWNER" },
          });

          await tx.collection.create({
            data: { name: "My APIs", workspaceId: workspace.id },
          });

          return newUser;
        });
      }
    } else {
      user = accountExists.user;
    }

    if (!user) return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);

    res.clearCookie("state");
    const token = generateToken(user.id);
    setAuthCookie(res as any, token);
    return res.redirect(`${env.FRONTEND_URL}/workspace`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.userId) throw new AppError(401, "Unauthorized", []);
  const userData = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!userData) throw new AppError(404, "User not found", []);

  const { password: _pw, ...safeUser } = userData;
  return res.status(200).json(safeUser);
};
