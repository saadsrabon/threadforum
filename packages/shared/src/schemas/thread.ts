import { z } from "zod";

export const createThreadSchema = z.object({
  communityId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(10).max(200),
  content: z.string().trim().min(1).max(20_000),
  tagIds: z.array(z.string().uuid()).min(1).max(5),
});

export const updateThreadSchema = createThreadSchema.partial().extend({
  pinned: z.boolean().optional(),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;
