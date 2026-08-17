import { z } from "zod";

const usernameRegex = /^[a-z0-9_]{3,30}$/;

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z.string().regex(usernameRegex, {
    message: "Username must be 3-30 chars: lowercase letters, numbers, underscore",
  }),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
  displayName: z.string().trim().min(2).max(50),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(255),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
