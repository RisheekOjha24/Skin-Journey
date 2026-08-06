import { z } from "zod";
import { MILESTONE_CATEGORIES } from "../config/constants";

export const createMilestoneSchema = z.object({
  body: z.object({
    category: z.enum(MILESTONE_CATEGORIES),
    title: z.string().min(1, "Title is required").max(160),
    description: z.string().max(2000).optional(),
    occurredAt: z.string().datetime().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const milestoneIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
