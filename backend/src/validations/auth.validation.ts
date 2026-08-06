import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    displayName: z.string().min(1, "Name is required").max(80),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
