import { db } from "../connection";
import { generateId } from "../../utils/id.util";

export interface ProgressSummaryRecord {
  id: string;
  user_id: string;
  summary_text: string;
  scan_range_start: string;
  scan_range_end: string;
  scan_count: number;
  generated_at: string;
}

export const summaryRepository = {
  create(input: {
    userId: string;
    summaryText: string;
    scanRangeStart: string;
    scanRangeEnd: string;
    scanCount: number;
  }): ProgressSummaryRecord {
    const id = generateId("summary");
    db.prepare(
      `INSERT INTO progress_summaries (id, user_id, summary_text, scan_range_start, scan_range_end, scan_count)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, input.userId, input.summaryText, input.scanRangeStart, input.scanRangeEnd, input.scanCount);

    return db.prepare("SELECT * FROM progress_summaries WHERE id = ?").get(id) as ProgressSummaryRecord;
  },

  latestForUser(userId: string): ProgressSummaryRecord | undefined {
    return db
      .prepare("SELECT * FROM progress_summaries WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1")
      .get(userId) as ProgressSummaryRecord | undefined;
  },
};
