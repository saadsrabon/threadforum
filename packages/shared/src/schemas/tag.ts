import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tag name must be at least 2 characters")
    .max(40, "Tag name must be at most 40 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Tag name can only contain letters, numbers, spaces, and hyphens"),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
