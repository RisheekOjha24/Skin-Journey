import { z } from "zod";

export const createJournalEntrySchema = z.object({
  body: z.object({
    scanId: z.string().optional(),
    entryDate: z.string().datetime().optional(),
    productsUsed: z.array(z.string()).optional().default([]),
    routineMorning: z.string().max(2000).optional(),
    routineEvening: z.string().max(2000).optional(),
    waterIntakeLiters: z.number().min(0).max(20).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    dietNotes: z.string().max(2000).optional(),
    notes: z.string().max(4000).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateJournalEntrySchema = z.object({
  body: createJournalEntrySchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});

export const listJournalSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  params: z.object({}).optional(),
});
