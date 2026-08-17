import { Router } from "express";
import { searchQuerySchema } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";

export const searchRouter = Router();

searchRouter.get("/", async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues,
    });
  }

  const { q, tag, type, sort } = parsed.data;
  const orderBy =
    sort === "new"
      ? { createdAt: "desc" as const }
      : sort === "top"
        ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };

  const results: {
    threads: unknown[];
    communities: unknown[];
    users: unknown[];
  } = { threads: [], communities: [], users: [] };

  if (type === "all" || type === "threads") {
    results.threads = await prisma.thread.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { contentPlain: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(tag
          ? {
              tags: {
                some: { tag: { slug: tag.toLowerCase() } },
              },
            }
          : {}),
      },
      orderBy,
      take: 20,
      include: {
        author: { select: { username: true, displayName: true } },
        community: { select: { name: true, slug: true, themeColor: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }).then((threads) =>
      threads.map((t) => ({
        type: "thread" as const,
        id: t.id,
        title: t.title,
        excerpt: t.contentPlain.slice(0, 180),
        community: t.community,
        author: t.author,
        tags: t.tags.map((x) => x.tag),
        commentCount: t._count.comments,
        reactionCount: t._count.reactions,
        createdAt: t.createdAt,
      })),
    );
  }

  if (type === "all" || type === "communities") {
    results.communities = await prisma.community.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { name: "asc" },
      take: 10,
      include: { _count: { select: { members: true, threads: true } } },
    }).then((communities) =>
      communities.map((c) => ({
        type: "community" as const,
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        themeColor: c.themeColor,
        memberCount: c._count.members,
        threadCount: c._count.threads,
      })),
    );
  }

  if (type === "all" || type === "users") {
    results.users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { displayName: "asc" },
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
      },
    }).then((users) =>
      users.map((u) => ({ type: "user" as const, ...u })),
    );
  }

  return res.json({
    query: q ?? tag ?? "",
    sort,
    results,
  });
});
