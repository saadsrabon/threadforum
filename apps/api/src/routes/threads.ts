import { Router } from "express";
import { createCommentSchema, createThreadSchema, CONTENT_LIMITS } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { sanitizeContent, slugify, stripHtml } from "../lib/sanitize.js";
import { emitNotification, emitThreadComment } from "../lib/socket.js";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const threadsRouter = Router();

threadsRouter.post("/", requireAuth, validateBody(createThreadSchema), async (req, res) => {
  const { communityId, title, content, tagIds } = req.body;

  let community: { id: string; slug: string } | null = null;
  if (communityId) {
    community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, slug: true },
    });
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
  }

  const tags = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
  if (tags.length !== tagIds.length) {
    return res.status(400).json({ error: "One or more tags are invalid" });
  }

  const contentHtml = sanitizeContent(content);
  const contentPlain = stripHtml(contentHtml);

  if (contentPlain.length < CONTENT_LIMITS.threadBodyMin) {
    return res.status(400).json({
      error: `Content must be at least ${CONTENT_LIMITS.threadBodyMin} characters`,
    });
  }

  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = "thread";

  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 5) {
    const existing = community
      ? await prisma.thread.findFirst({
          where: { communityId: community.id, slug },
        })
      : await prisma.thread.findFirst({
          where: { communityId: null, slug },
        });
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const thread = await prisma.thread.create({
    data: {
      communityId: community?.id ?? null,
      authorId: req.user!.id,
      title,
      slug,
      contentHtml,
      contentPlain,
      tags: {
        create: tagIds.map((tagId: string) => ({ tagId })),
      },
    },
    include: {
      community: { select: { slug: true } },
      tags: { include: { tag: true } },
    },
  });

  return res.status(201).json({
    thread: {
      id: thread.id,
      slug: thread.slug,
      communitySlug: thread.community?.slug ?? null,
      tags: thread.tags.map((t) => t.tag),
    },
  });
});

threadsRouter.post(
  "/:id/comments",
  requireAuth,
  validateBody(createCommentSchema),
  async (req, res) => {
    const threadId = param(req.params.id);
    const { content, parentId } = req.body;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { id: true, authorId: true, title: true, community: { select: { slug: true } } },
    });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    if (parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, threadId },
      });
      if (!parent) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }

    const contentHtml = sanitizeContent(`<p>${content.replace(/\n/g, "</p><p>")}</p>`);
    const contentPlain = stripHtml(contentHtml);

    const comment = await prisma.comment.create({
      data: {
        threadId,
        authorId: req.user!.id,
        parentId: parentId ?? null,
        contentHtml,
        contentPlain,
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    const commentCount = await prisma.comment.count({ where: { threadId } });

    emitThreadComment(threadId, {
      threadId,
      comment,
      commentCount,
    });

    if (thread.authorId !== req.user!.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: thread.authorId,
          type: "REPLY",
          title: "New reply on your thread",
          body: thread.title,
          link: thread.community
            ? `/c/${thread.community.slug}/t/${thread.id}`
            : `/t/${thread.id}`,
        },
      });
      emitNotification(thread.authorId, notification);
    }

    return res.status(201).json({ comment, commentCount });
  },
);

threadsRouter.get("/:id", optionalAuth, async (req, res) => {
  const threadId = param(req.params.id);
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          themeColor: true,
          rules: true,
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          _count: { select: { reactions: true, replies: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { id: true, username: true, displayName: true, avatarUrl: true },
              },
              _count: { select: { reactions: true } },
            },
          },
        },
      },
    },
  });

  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  await prisma.thread.update({
    where: { id: thread.id },
    data: { viewCount: { increment: 1 } },
  });

  let userReacted = false;
  let userBookmarked = false;
  if (req.user) {
    const [reaction, bookmark] = await Promise.all([
      prisma.reaction.findFirst({ where: { userId: req.user.id, threadId } }),
      prisma.bookmark.findUnique({
        where: { userId_threadId: { userId: req.user.id, threadId } },
      }),
    ]);
    userReacted = Boolean(reaction);
    userBookmarked = Boolean(bookmark);
  }

  const relatedThreads = await prisma.thread.findMany({
    where: {
      ...(thread.communityId
        ? { communityId: thread.communityId, id: { not: thread.id } }
        : { communityId: null, id: { not: thread.id } }),
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      author: { select: { username: true, displayName: true } },
      community: { select: { name: true, slug: true, themeColor: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  return res.json({
    thread: {
      id: thread.id,
      title: thread.title,
      slug: thread.slug,
      contentHtml: thread.contentHtml,
      contentPlain: thread.contentPlain,
      pinned: thread.pinned,
      viewCount: thread.viewCount + 1,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: thread.author,
      community: thread.community,
      tags: thread.tags.map((t) => t.tag),
      commentCount: thread._count.comments,
      reactionCount: thread._count.reactions,
      userReacted,
      userBookmarked,
      comments: thread.comments.map((c) => ({
        id: c.id,
        contentHtml: c.contentHtml,
        contentPlain: c.contentPlain,
        createdAt: c.createdAt,
        author: c.author,
        reactionCount: c._count.reactions,
        replyCount: c._count.replies,
        replies: c.replies.map((r) => ({
          id: r.id,
          contentHtml: r.contentHtml,
          contentPlain: r.contentPlain,
          createdAt: r.createdAt,
          author: r.author,
          reactionCount: r._count.reactions,
        })),
      })),
    },
    relatedThreads: relatedThreads.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      author: t.author,
      community: t.community,
      tags: t.tags.map((tag) => tag.tag),
      commentCount: t._count.comments,
      reactionCount: t._count.reactions,
    })),
  });
});
