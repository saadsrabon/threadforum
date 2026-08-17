import { Router } from "express";
import { updateProfileSchema } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { emitNotification } from "../lib/socket.js";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const usersRouter = Router();

usersRouter.patch("/me", requireAuth, validateBody(updateProfileSchema), async (req, res) => {
  const { displayName, bio, location, website, avatarUrl, isPublic } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website: website || null }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(isPublic !== undefined && { isPublic }),
    },
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

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      location: user.location,
      website: user.website,
      isPublic: user.isPublic,
      createdAt: user.createdAt,
    },
  });
});

usersRouter.get("/:username", optionalAuth, async (req, res) => {
  const username = param(req.params.username).toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      location: true,
      website: true,
      isPublic: true,
      createdAt: true,
      _count: {
        select: {
          threads: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.isPublic && req.user?.id !== user.id) {
    return res.status(403).json({ error: "Profile is private" });
  }

  const threads = await prisma.thread.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      community: { select: { name: true, slug: true, themeColor: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  const communities = await prisma.communityMember.findMany({
    where: { userId: user.id },
    take: 8,
    include: {
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          themeColor: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  let isFollowing = false;
  if (req.user && req.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = Boolean(follow);
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      location: user.location,
      website: user.website,
      isPublic: user.isPublic,
      joinedAt: user.createdAt,
      postCount: user._count.threads,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
      isSelf: req.user?.id === user.id,
    },
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      excerpt: t.contentPlain.slice(0, 160),
      community: t.community,
      tags: t.tags.map((x) => x.tag),
      commentCount: t._count.comments,
      reactionCount: t._count.reactions,
      createdAt: t.createdAt,
    })),
    communities: communities.map((m) => ({
      ...m.community,
      memberCount: m.community._count.members,
    })),
  });
});

usersRouter.post("/:username/follow", requireAuth, async (req, res) => {
  const username = param(req.params.username).toLowerCase();
  const target = await prisma.user.findUnique({ where: { username } });

  if (!target) {
    return res.status(404).json({ error: "User not found" });
  }

  if (target.id === req.user!.id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: target.id,
      },
    },
    create: {
      followerId: req.user!.id,
      followingId: target.id,
    },
    update: {},
  });

  const notification = await prisma.notification.create({
    data: {
      userId: target.id,
      type: "FOLLOW",
      title: "New follower",
      body: `${req.user!.displayName} started following you`,
      link: `/u/${req.user!.username}`,
    },
  });
  emitNotification(target.id, notification);

  return res.json({ ok: true, following: true });
});

usersRouter.delete("/:username/follow", requireAuth, async (req, res) => {
  const username = param(req.params.username).toLowerCase();
  const target = await prisma.user.findUnique({ where: { username } });

  if (!target) {
    return res.status(404).json({ error: "User not found" });
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: req.user!.id,
      followingId: target.id,
    },
  });

  return res.json({ ok: true, following: false });
});
