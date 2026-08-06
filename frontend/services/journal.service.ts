import { apiRequest, apiRequestWithMeta } from "@/lib/api-client";
import { JournalEntry, Pagination } from "@/types";

export interface JournalEntryInput {
  scanId?: string;
  entryDate?: string;
  productsUsed?: string[];
  routineMorning?: string;
  routineEvening?: string;
  waterIntakeLiters?: number;
  sleepHours?: number;
  dietNotes?: string;
  notes?: string;
}

export const journalService = {
  create(input: JournalEntryInput) {
    return apiRequest<JournalEntry>("/api/journal", { method: "POST", body: input });
  },
  update(id: string, input: Partial<JournalEntryInput>) {
    return apiRequest<JournalEntry>(`/api/journal/${id}`, { method: "PATCH", body: input });
  },
  delete(id: string) {
    return apiRequest<{ deleted: boolean }>(`/api/journal/${id}`, { method: "DELETE" });
  },
  async list(params: { page?: number; limit?: number } = {}) {
    return apiRequestWithMeta<JournalEntry[]>("/api/journal", { query: params }).then((r) => ({
      entries: r.data,
      pagination: r.meta?.pagination as Pagination | undefined,
    }));
  },
  getById(id: string) {
    return apiRequest<JournalEntry>(`/api/journal/${id}`);
  },
};
