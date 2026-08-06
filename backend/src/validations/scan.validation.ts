import { z } from "zod";
import { SCAN_TYPE } from "../config/constants";

export const createScanSchema = z.object({
  body: z.object({
    scanType: z.enum([SCAN_TYPE.BASELINE, SCAN_TYPE.WEEKLY, SCAN_TYPE.MANUAL]).default(SCAN_TYPE.WEEKLY),
    capturedAt: z.string().datetime().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const listScansSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
  params: z.object({}).optional(),
});

export const scanIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const compareScansSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    beforeId: z.string().min(1, "beforeId is required"),
    afterId: z.string().min(1, "afterId is required"),
  }),
  params: z.object({}).optional(),
});

export const bulkDeleteScansSchema = z.object({
  body: z.object({
    ids: z.array(z.string().min(1)).min(1, "At least one scan id is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
