import { apiRequest } from "@/lib/api-client";
import { ProgressSummary } from "@/types";

export const summaryService = {
  generate() {
    return apiRequest<ProgressSummary>("/api/summary/generate", { method: "POST" });
  },
  getLatest() {
    return apiRequest<ProgressSummary | null>("/api/summary/latest");
  },
};
