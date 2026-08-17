import { Router } from "express";
import { createCommunitySchema } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

const privacyMap = {
  public: "PUBLIC",
  restricted: "RESTRICTED",
  private: "PRIVATE",
} as const;

export const communitiesRouter = Router();

communitiesRouter.post("/", requireAuth, validateBody(createCommunitySchema), async (req, res) => {
  const { name, slug, description, tagIds, privacy, themeColor, coverUrl, iconUrl, rules } = req.body;

  const existing = await prisma.community.findUnique({ where: { slug } });
  if (existing) {
    return res.status(409).json({ error: "Slug already taken" });
  }

  if (tagIds?.length) {
    const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
    if (tags.length !== tagIds.length) {
      return res.status(400).json({ error: "One or more tags are invalid" });
    }
  }

  const community = await prisma.community.create({
    data: {
      name,
      slug,
      description,
      privacy: privacyMap[privacy as keyof typeof privacyMap] ?? "PUBLIC",
      themeColor: themeColor ?? "#C41E3A",
      coverUrl: coverUrl ?? null,
      iconUrl: iconUrl ?? null,
      rules: rules ?? [],
      members: {
        create: {
          userId: req.user!.id,
          role: "moderator",
        },
      },
      ...(tagIds?.length
        ? {
            tags: {
              create: tagIds.map((tagId: string) => ({ tagId })),
            },
          }
        : {}),
    },
  });

  return res.status(201).json({
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
    },
  });
});

communitiesRouter.get("/", async (_req, res) => {
  const communities = await prisma.community.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true, threads: true } },
    },
  });

  return res.json({
    communities: communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      privacy: c.privacy,
      themeColor: c.themeColor,
      memberCount: c._count.members,
      threadCount: c._count.threads,
    })),
  });
});

communitiesRouter.get("/:slug", optionalAuth, async (req, res) => {
  const slug = param(req.params.slug);
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, threads: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!community) {
    return res.status(404).json({ error: "Community not found" });
  }

  const moderators = await prisma.communityMember.findMany({
    where: { communityId: community.id, role: "moderator" },
    take: 5,
    include: {
      user: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  });

  const pinnedThreads = await prisma.thread.findMany({
    where: { communityId: community.id, pinned: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  const threads = await prisma.thread.findMany({
    where: { communityId: community.id, pinned: false },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, username: true, displayName: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  let isMember = false;
  if (req.user) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: req.user.id,
          communityId: community.id,
        },
      },
    });
    isMember = Boolean(membership);
  }

  return res.json({
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      privacy: community.privacy,
      coverUrl: community.coverUrl,
      iconUrl: community.iconUrl,
      themeColor: community.themeColor,
      rules: community.rules,
      memberCount: community._count.members,
      threadCount: community._count.threads,
      tags: community.tags.map((t) => t.tag),
      moderators: moderators.map((m) => m.user),
      isMember,
    },
    pinnedThreads: pinnedThreads.map(formatThread),
    threads: threads.map(formatThread),
  });
});

communitiesRouter.post("/:slug/join", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const community = await prisma.community.findUnique({
    where: { slug: param(req.params.slug) },
  });

  if (!community) {
    return res.status(404).json({ error: "Community not found" });
  }

  await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId,
        communityId: community.id,
      },
    },
    create: {
      userId,
      communityId: community.id,
    },
    update: {},
  });

  return res.json({ ok: true, joined: true });
});

communitiesRouter.delete("/:slug/join", requireAuth, async (req, res) => {
  const community = await prisma.community.findUnique({
    where: { slug: param(req.params.slug) },
  });

  if (!community) {
    return res.status(404).json({ error: "Community not found" });
  }

  await prisma.communityMember.deleteMany({
    where: {
      userId: req.user!.id,
      communityId: community.id,
    },
  });

  return res.json({ ok: true, joined: false });
});

function formatThread(thread: {
  id: string;
  title: string;
  slug: string;
  contentPlain: string;
  pinned: boolean;
  viewCount: number;
  createdAt: Date;
  author: { id: string; username: string; displayName: string };
  tags: { tag: { id: string; name: string; slug: string } }[];
  _count: { comments: number; reactions: number };
}) {
  return {
    id: thread.id,
    title: thread.title,
    slug: thread.slug,
    excerpt: thread.contentPlain.slice(0, 180),
    pinned: thread.pinned,
    viewCount: thread.viewCount,
    createdAt: thread.createdAt,
    author: thread.author,
    tags: thread.tags.map((t) => t.tag),
    commentCount: thread._count.comments,
    reactionCount: thread._count.reactions,
  };
}
