import { journalRepository, JournalEntryRecord } from "../db/repositories/journal.repository";
import { ApiError } from "../utils/api-error.util";

function toPublicEntry(entry: JournalEntryRecord) {
  return {
    id: entry.id,
    scanId: entry.scan_id,
    entryDate: entry.entry_date,
    productsUsed: entry.products_used ? JSON.parse(entry.products_used) : [],
    routineMorning: entry.routine_morning,
    routineEvening: entry.routine_evening,
    waterIntakeLiters: entry.water_intake_liters,
    sleepHours: entry.sleep_hours,
    dietNotes: entry.diet_notes,
    notes: entry.notes,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  };
}

export const journalService = {
  create(userId: string, input: Parameters<typeof journalRepository.create>[1]) {
    const entry = journalRepository.create(userId, input);
    return toPublicEntry(entry);
  },

  update(userId: string, entryId: string, input: Parameters<typeof journalRepository.update>[1]) {
    const existing = journalRepository.findByIdForUser(entryId, userId);
    if (!existing) {
      throw ApiError.notFound("Journal entry not found");
    }
    const updated = journalRepository.update(entryId, input);
    return toPublicEntry(updated!);
  },

  delete(userId: string, entryId: string) {
    const existing = journalRepository.findByIdForUser(entryId, userId);
    if (!existing) {
      throw ApiError.notFound("Journal entry not found");
    }
    journalRepository.delete(entryId, userId);
  },

  bulkDelete(userId: string, ids: string[]) {
    return journalRepository.bulkDelete(ids, userId);
  },

  list(userId: string, opts: { page?: number; limit?: number }) {
    const { rows, total } = journalRepository.listForUser(userId, opts);
    return {
      entries: rows.map(toPublicEntry),
      pagination: {
        page: opts.page ?? 1,
        limit: opts.limit ?? 20,
        total,
        totalPages: Math.max(1, Math.ceil(total / (opts.limit ?? 20))),
      },
    };
  },

  getById(userId: string, entryId: string) {
    const entry = journalRepository.findByIdForUser(entryId, userId);
    if (!entry) {
      throw ApiError.notFound("Journal entry not found");
    }
    return toPublicEntry(entry);
  },
};
