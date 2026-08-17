import { Router } from "express";
import type { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const NOTIFICATION_TYPES = new Set<string>([
  "REPLY",
  "MENTION",
  "FOLLOW",
  "COMMUNITY",
  "MESSAGE",
  "MODERATION",
]);

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
  const cursor =
    typeof req.query.cursor === "string" && req.query.cursor.length > 0
      ? req.query.cursor
      : undefined;
  const typeFilter =
    typeof req.query.type === "string" && NOTIFICATION_TYPES.has(req.query.type)
      ? (req.query.type as NotificationType)
      : undefined;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user!.id,
      ...(typeFilter && { type: typeFilter }),
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = notifications.length > limit;
  const items = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor =
    hasMore && items.length > 0 ? items[items.length - 1]!.createdAt.toISOString() : null;

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });

  return res.json({ notifications: items, unreadCount, nextCursor });
});

notificationsRouter.post("/read-all", requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  return res.json({ ok: true });
});

notificationsRouter.post("/:id/read", requireAuth, async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await prisma.notification.updateMany({
    where: { id, userId: req.user!.id },
    data: { read: true },
  });
  return res.json({ ok: true });
});
