import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(5_000),
  parentId: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  tag: z.string().trim().min(2).max(32).optional(),
  type: z.enum(["all", "threads", "communities", "users"]).default("all"),
  sort: z.enum(["relevance", "new", "top"]).default("relevance"),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
