import { z } from "zod";

const passwordRules = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  location: z.string().trim().max(100).nullable().optional(),
  website: z
    .union([z.string().url().max(255), z.literal("")])
    .nullable()
    .optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  isPublic: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: passwordRules,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
