import { Router } from "express";
import bcrypt from "bcryptjs";
import { changePasswordSchema, loginSchema, registerSchema } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";
import {
  accessCookieOptions,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  signSocketToken,
  SOCKET_TOKEN_TTL_SECONDS,
  verifyRefreshToken,
} from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

export const authRouter = Router();

function toPublicUser(user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location?: string | null;
  website?: string | null;
  isPublic?: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    location: user.location ?? null,
    website: user.website ?? null,
    isPublic: user.isPublic ?? true,
    createdAt: user.createdAt,
  };
}

function setAuthCookies(
  res: import("express").Response,
  user: { id: string; username: string; email: string },
) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  res.cookie("access_token", signAccessToken(payload), accessCookieOptions);
  res.cookie("refresh_token", signRefreshToken(payload), refreshCookieOptions);
}

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { email, username, password, displayName } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return res.status(409).json({ error: `${field} already in use` });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, displayName },
  });

  setAuthCookies(res, user);
  return res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { identifier, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  setAuthCookies(res, user);
  return res.json({ user: toPublicUser(user) });
});

authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies?.refresh_token as string | undefined;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    setAuthCookies(res, user);
    return res.json({ user: toPublicUser(user) });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  return res.json({ ok: true });
});

authRouter.get("/socket-token", requireAuth, (req, res) => {
  const token = signSocketToken({
    sub: req.user!.id,
    username: req.user!.username,
    email: req.user!.email,
  });

  return res.json({
    token,
    expiresIn: SOCKET_TOKEN_TTL_SECONDS,
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      location: true,
      website: true,
      isPublic: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user: toPublicUser(user) });
});

authRouter.post("/change-password", requireAuth, validateBody(changePasswordSchema), async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return res.json({ ok: true });
});
