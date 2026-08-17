import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { emitThreadReaction } from "../lib/socket.js";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const interactionsRouter = Router();

interactionsRouter.post("/threads/:id/react", requireAuth, async (req, res) => {
  const threadId = param(req.params.id);
  const userId = req.user!.id;

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const existing = await prisma.reaction.findFirst({
    where: { userId, threadId },
  });

  let reacted: boolean;
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    reacted = false;
  } else {
    await prisma.reaction.create({ data: { userId, threadId } });
    reacted = true;
  }

  const reactionCount = await prisma.reaction.count({ where: { threadId } });

  emitThreadReaction(threadId, {
    threadId,
    reactionCount,
    reacted,
    userId,
  });

  return res.json({ reacted, reactionCount });
});

interactionsRouter.post("/threads/:id/bookmark", requireAuth, async (req, res) => {
  const threadId = param(req.params.id);
  const userId = req.user!.id;

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_threadId: { userId, threadId } },
  });

  let bookmarked: boolean;
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    bookmarked = false;
  } else {
    await prisma.bookmark.create({ data: { userId, threadId } });
    bookmarked = true;
  }

  return res.json({ bookmarked });
});

interactionsRouter.get("/bookmarks", requireAuth, async (req, res) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      thread: {
        include: {
          author: { select: { username: true, displayName: true } },
          community: { select: { name: true, slug: true, themeColor: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      },
    },
  });

  return res.json({
    bookmarks: bookmarks.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      thread: {
        id: b.thread.id,
        title: b.thread.title,
        excerpt: b.thread.contentPlain.slice(0, 160),
        community: b.thread.community,
        author: b.thread.author,
        tags: b.thread.tags.map((t) => t.tag),
        commentCount: b.thread._count.comments,
        reactionCount: b.thread._count.reactions,
      },
    })),
  });
});
