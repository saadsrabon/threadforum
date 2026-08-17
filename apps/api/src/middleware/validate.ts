import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => {
          const field = issue.path.length ? issue.path.join(".") : "input";
          return `${field}: ${issue.message}`;
        })
        .join(". ");
      return res.status(400).json({
        error: message,
        details: parsed.error.issues,
      });
    }
    req.body = parsed.data;
    next();
  };
}
