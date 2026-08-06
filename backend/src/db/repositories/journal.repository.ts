import { db } from "../connection";
import { generateId } from "../../utils/id.util";
import { PAGINATION_DEFAULTS } from "../../config/constants";

export interface JournalEntryRecord {
  id: string;
  user_id: string;
  scan_id: string | null;
  entry_date: string;
  products_used: string | null;
  routine_morning: string | null;
  routine_evening: string | null;
  water_intake_liters: number | null;
  sleep_hours: number | null;
  diet_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertJournalInput {
  scanId?: string | null;
  entryDate?: string;
  productsUsed?: string[];
  routineMorning?: string;
  routineEvening?: string;
  waterIntakeLiters?: number;
  sleepHours?: number;
  dietNotes?: string;
  notes?: string;
}

export const journalRepository = {
  create(userId: string, input: UpsertJournalInput): JournalEntryRecord {
    const id = generateId("journal");
    db.prepare(
      `INSERT INTO journal_entries
        (id, user_id, scan_id, entry_date, products_used, routine_morning, routine_evening, water_intake_liters, sleep_hours, diet_notes, notes)
       VALUES (?, ?, ?, COALESCE(?, datetime('now')), ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      input.scanId ?? null,
      input.entryDate ?? null,
      JSON.stringify(input.productsUsed ?? []),
      input.routineMorning ?? null,
      input.routineEvening ?? null,
      input.waterIntakeLiters ?? null,
      input.sleepHours ?? null,
      input.dietNotes ?? null,
      input.notes ?? null
    );
    return this.findById(id)!;
  },

  update(id: string, input: UpsertJournalInput): JournalEntryRecord | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    db.prepare(
      `UPDATE journal_entries SET
        scan_id = ?, entry_date = COALESCE(?, entry_date), products_used = ?,
        routine_morning = ?, routine_evening = ?, water_intake_liters = ?,
        sleep_hours = ?, diet_notes = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      input.scanId !== undefined ? input.scanId : existing.scan_id,
      input.entryDate ?? null,
      input.productsUsed !== undefined ? JSON.stringify(input.productsUsed) : existing.products_used,
      input.routineMorning ?? existing.routine_morning,
      input.routineEvening ?? existing.routine_evening,
      input.waterIntakeLiters ?? existing.water_intake_liters,
      input.sleepHours ?? existing.sleep_hours,
      input.dietNotes ?? existing.diet_notes,
      input.notes ?? existing.notes,
      id
    );

    return this.findById(id);
  },

  findById(id: string): JournalEntryRecord | undefined {
    return db.prepare("SELECT * FROM journal_entries WHERE id = ?").get(id) as
      | JournalEntryRecord
      | undefined;
  },

  findByIdForUser(id: string, userId: string): JournalEntryRecord | undefined {
    return db
      .prepare("SELECT * FROM journal_entries WHERE id = ? AND user_id = ?")
      .get(id, userId) as JournalEntryRecord | undefined;
  },

  delete(id: string, userId: string): boolean {
    const result = db
      .prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?")
      .run(id, userId);
    return result.changes > 0;
  },

  listForUser(userId: string, opts: { page?: number; limit?: number } = {}) {
    const page = opts.page ?? PAGINATION_DEFAULTS.page;
    const limit = opts.limit ?? PAGINATION_DEFAULTS.limit;
    const offset = (page - 1) * limit;

    const rows = db
      .prepare(
        "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT ? OFFSET ?"
      )
      .all(userId, limit, offset) as JournalEntryRecord[];

    const { count } = db
      .prepare("SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?")
      .get(userId) as { count: number };

    return { rows, total: count };
  },

  allForUserOrdered(userId: string): JournalEntryRecord[] {
    return db
      .prepare("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date ASC")
      .all(userId) as JournalEntryRecord[];
  },
};
