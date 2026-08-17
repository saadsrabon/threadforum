import { Router } from "express";
import { createTagSchema } from "@threadsphere/shared";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { slugify } from "../lib/sanitize.js";

export const tagsRouter = Router();

tagsRouter.post("/", requireAuth, validateBody(createTagSchema), async (req, res) => {
  const name = req.body.name.trim();
  const slug = slugify(name) || name.toLowerCase().replace(/\s+/g, "-");

  const existing = await prisma.tag.findFirst({
    where: {
      OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }],
    },
  });

  if (existing) {
    return res.json({ tag: existing, created: false });
  }

  const tag = await prisma.tag.create({
    data: { name, slug },
  });

  return res.status(201).json({ tag, created: true });
});

tagsRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const communityId =
    typeof req.query.communityId === "string" ? req.query.communityId : undefined;

  let tagIds: string[] | undefined;
  if (communityId) {
    const communityTags = await prisma.communityTag.findMany({
      where: { communityId },
      select: { tagId: true },
    });
    tagIds = communityTags.map((t) => t.tagId);
  }

  const tags = await prisma.tag.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tagIds ? { id: { in: tagIds } } : {}),
    },
    orderBy: { name: "asc" },
    take: 30,
  });

  return res.json({ tags });
});
