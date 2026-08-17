import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const feedRouter = Router();

feedRouter.get("/", async (_req, res) => {
  const threads = await prisma.thread.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 10,
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      community: { select: { name: true, slug: true, themeColor: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  const [featured, ...rest] = threads;

  return res.json({
    featured: featured ? formatFeedThread(featured) : null,
    threads: rest.map(formatFeedThread),
  });
});

function formatFeedThread(thread: {
  id: string;
  title: string;
  slug: string;
  contentPlain: string;
  pinned: boolean;
  createdAt: Date;
  author: { id: string; username: string; displayName: string };
  community: { name: string; slug: string; themeColor: string | null } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  _count: { comments: number; reactions: number };
}) {
  return {
    id: thread.id,
    title: thread.title,
    slug: thread.slug,
    excerpt: thread.contentPlain.slice(0, 180),
    pinned: thread.pinned,
    createdAt: thread.createdAt,
    author: thread.author,
    community: thread.community,
    tags: thread.tags.map((t) => t.tag),
    commentCount: thread._count.comments,
    reactionCount: thread._count.reactions,
  };
}
