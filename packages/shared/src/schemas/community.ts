import { z } from "zod";

const slugRegex = /^[a-z0-9-]{3,50}$/;

export const createCommunitySchema = z.object({
  name: z.string().trim().min(3).max(80),
  slug: z.string().regex(slugRegex, {
    message: "Slug must be 3-50 chars: lowercase letters, numbers, hyphens",
  }),
  description: z.string().trim().min(10).max(500),
  tagIds: z.array(z.string().uuid()).max(10).optional(),
  privacy: z.enum(["public", "restricted", "private"]).default("public"),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  coverUrl: z.string().url().max(500).optional(),
  iconUrl: z.string().url().max(500).optional(),
  rules: z.array(z.string().trim().min(5).max(500)).max(20).optional(),
});

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;

export const communityPrivacy = ["public", "restricted", "private"] as const;
export type CommunityPrivacy = (typeof communityPrivacy)[number];
