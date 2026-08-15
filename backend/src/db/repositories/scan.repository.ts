import { db } from "../connection";
import { generateId } from "../../utils/id.util";
import { PAGINATION_DEFAULTS } from "../../config/constants";

export interface ScanRecord {
  id: string;
  user_id: string;
  scan_type: string;
  image_path: string;
  overlay_image_path: string | null;
  overall_score: number | null;
  metrics_json: string;
  raw_response_json: string | null;
  captured_at: string;
  created_at: string;
}

export interface CreateScanInput {
  userId: string;
  scanType: string;
  imagePath: string;
  overlayImagePath: string | null;
  overallScore: number | null;
  metrics: Record<string, number>;
  rawResponse: unknown;
  capturedAt?: string;
}

export const scanRepository = {
  create(input: CreateScanInput): ScanRecord {
    const id = generateId("scan");
    const capturedAt = input.capturedAt ?? new Date().toISOString();
    db.prepare(
      `INSERT INTO scans
        (id, user_id, scan_type, image_path, overlay_image_path, overall_score, metrics_json, raw_response_json, captured_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.userId,
      input.scanType,
      input.imagePath,
      input.overlayImagePath,
      input.overallScore,
      JSON.stringify(input.metrics),
      JSON.stringify(input.rawResponse ?? null),
      capturedAt
    );

    return this.findById(id)!;
  },

  findById(id: string): ScanRecord | undefined {
    return db.prepare("SELECT * FROM scans WHERE id = ?").get(id) as ScanRecord | undefined;
  },

  findByIdForUser(id: string, userId: string): ScanRecord | undefined {
    return db.prepare("SELECT * FROM scans WHERE id = ? AND user_id = ?").get(id, userId) as
      | ScanRecord
      | undefined;
  },

  listForUser(
    userId: string,
    opts: { page?: number; limit?: number; from?: string; to?: string } = {}
  ): { rows: ScanRecord[]; total: number } {
    const page = opts.page ?? PAGINATION_DEFAULTS.page;
    const limit = opts.limit ?? PAGINATION_DEFAULTS.limit;
    const offset = (page - 1) * limit;

    const conditions = ["user_id = ?"];
    const params: unknown[] = [userId];

    if (opts.from) {
      conditions.push("captured_at >= ?");
      params.push(opts.from);
    }
    if (opts.to) {
      conditions.push("captured_at <= ?");
      params.push(opts.to);
    }

    const whereClause = conditions.join(" AND ");

    const rows = db
      .prepare(
        `SELECT * FROM scans WHERE ${whereClause} ORDER BY captured_at ASC LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as ScanRecord[];

    const { count } = db
      .prepare(`SELECT COUNT(*) as count FROM scans WHERE ${whereClause}`)
      .get(...params) as { count: number };

    return { rows, total: count };
  },

  latestForUser(userId: string): ScanRecord | undefined {
    return db
      .prepare("SELECT * FROM scans WHERE user_id = ? ORDER BY captured_at DESC LIMIT 1")
      .get(userId) as ScanRecord | undefined;
  },

  countForUser(userId: string): number {
    const { count } = db
      .prepare("SELECT COUNT(*) as count FROM scans WHERE user_id = ?")
      .get(userId) as { count: number };
    return count;
  },

  allForUserOrdered(userId: string): ScanRecord[] {
    return db
      .prepare("SELECT * FROM scans WHERE user_id = ? ORDER BY captured_at ASC")
      .all(userId) as ScanRecord[];
  },

  delete(id: string, userId: string): boolean {
    const result = db.prepare("DELETE FROM scans WHERE id = ? AND user_id = ?").run(id, userId);
    return result.changes > 0;
  },

  /** Deletes every scan whose id is in `ids` and belongs to `userId`, returning the rows that were actually deleted (so callers can clean up their image files). */
  deleteMany(ids: string[], userId: string): ScanRecord[] {
    if (ids.length === 0) return [];

    const placeholders = ids.map(() => "?").join(", ");
    const owned = db
      .prepare(`SELECT * FROM scans WHERE user_id = ? AND id IN (${placeholders})`)
      .all(userId, ...ids) as ScanRecord[];

    if (owned.length === 0) return [];

    const deleteMany = db.transaction((rows: ScanRecord[]) => {
      const stmt = db.prepare("DELETE FROM scans WHERE id = ? AND user_id = ?");
      for (const row of rows) stmt.run(row.id, userId);
    });
    deleteMany(owned);

    return owned;
  },
};
