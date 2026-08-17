import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function findOrCreateThread(
  where: { communityId: string; slug: string } | { communityId: null; slug: string },
  create: Parameters<typeof prisma.thread.create>[0]["data"],
) {
  const existing = await prisma.thread.findFirst({ where });
  if (existing) return existing;
  return prisma.thread.create({ data: create });
}

async function main() {
  const passwordHash = await bcrypt.hash("Password1", 12);

  const maya = await prisma.user.upsert({
    where: { email: "maya@threadsphere.dev" },
    update: {},
    create: {
      email: "maya@threadsphere.dev",
      username: "maya_lin",
      displayName: "Maya Lin",
      passwordHash,
      bio: "Product designer focused on onboarding and design systems.",
    },
  });

  const ethan = await prisma.user.upsert({
    where: { email: "ethan@threadsphere.dev" },
    update: {},
    create: {
      email: "ethan@threadsphere.dev",
      username: "ethan_cole",
      displayName: "Ethan Cole",
      passwordHash,
      bio: "Backend engineer. Node.js, Redis, and API design.",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@threadsphere.dev" },
    update: {},
    create: {
      email: "demo@threadsphere.dev",
      username: "demo_user",
      displayName: "Demo User",
      passwordHash,
    },
  });

  const tags = await Promise.all(
    [
      { name: "UX", slug: "ux" },
      { name: "Onboarding", slug: "onboarding" },
      { name: "Research", slug: "research" },
      { name: "Node.js", slug: "nodejs" },
      { name: "API", slug: "api" },
      { name: "Announcement", slug: "announcement" },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      }),
    ),
  );

  const productDesign = await prisma.community.upsert({
    where: { slug: "product-design" },
    update: {},
    create: {
      name: "Product Design",
      slug: "product-design",
      description:
        "Critiques, research, and patterns for building thoughtful product experiences.",
      themeColor: "#C41E3A",
      rules: [
        "Be constructive in critiques",
        "Share context with design posts",
        "No self-promotion without value",
      ],
    },
  });

  const webDev = await prisma.community.upsert({
    where: { slug: "web-development" },
    update: {},
    create: {
      name: "Web Development",
      slug: "web-development",
      description: "Frontend, backend, and full-stack discussions for web builders.",
      themeColor: "#2563EB",
    },
  });

  for (const user of [maya, ethan, demo]) {
    for (const community of [productDesign, webDev]) {
      await prisma.communityMember.upsert({
        where: {
          userId_communityId: { userId: user.id, communityId: community.id },
        },
        update: {},
        create: {
          userId: user.id,
          communityId: community.id,
          role: user.id === maya.id ? "moderator" : "member",
        },
      });
    }
  }

  for (const tag of tags.slice(0, 3)) {
    await prisma.communityTag.upsert({
      where: {
        communityId_tagId: {
          communityId: productDesign.id,
          tagId: tag.id,
        },
      },
      update: {},
      create: { communityId: productDesign.id, tagId: tag.id },
    });
  }

  const featuredContent = `<p>We're reviewing first-run experiences across mobile and web. Share screenshots, friction points, and ideas for reducing time-to-value in the first session.</p><p>Focus areas: empty states, progressive disclosure, and error recovery.</p>`;

  const featured = await findOrCreateThread(
    { communityId: productDesign.id, slug: "design-critique-onboarding-flows" },
    {
      communityId: productDesign.id,
      authorId: maya.id,
      title: "Design Critique: Improving onboarding flows for early users",
      slug: "design-critique-onboarding-flows",
      contentHtml: featuredContent,
      contentPlain:
        "We're reviewing first-run experiences across mobile and web. Share screenshots, friction points, and ideas for reducing time-to-value in the first session. Focus areas: empty states, progressive disclosure, and error recovery.",
      pinned: true,
    },
  );

  const apiThread = await findOrCreateThread(
    { communityId: webDev.id, slug: "api-rate-limiting-nodejs" },
    {
      communityId: webDev.id,
      authorId: ethan.id,
      title: "Best practices for API rate limiting in Node.js",
      slug: "api-rate-limiting-nodejs",
      contentHtml:
        "<p>Sharing patterns we use for Express middleware, Redis token buckets, and graceful degradation under load.</p>",
      contentPlain:
        "Sharing patterns we use for Express middleware, Redis token buckets, and graceful degradation under load.",
    },
  );

  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]));

  for (const [threadId, slugs] of [
    [featured.id, ["ux", "onboarding", "research", "announcement"]],
    [apiThread.id, ["nodejs", "api"]],
  ] as const) {
    for (const slug of slugs) {
      const tagId = tagMap[slug];
      if (!tagId) continue;
      await prisma.threadTag.upsert({
        where: { threadId_tagId: { threadId, tagId } },
        update: {},
        create: { threadId, tagId },
      });
    }
  }

  await prisma.comment.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      threadId: featured.id,
      authorId: ethan.id,
      contentHtml:
        "<p>Love the focus on error recovery. We saw a 12% drop in drop-off when we added inline validation on signup.</p>",
      contentPlain:
        "Love the focus on error recovery. We saw a 12% drop in drop-off when we added inline validation on signup.",
    },
  });

  console.log("Seed complete.");
  console.log("Demo login: demo@threadsphere.dev / Password1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
