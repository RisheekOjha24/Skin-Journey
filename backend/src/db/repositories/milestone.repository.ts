import { db } from "../connection";
import { generateId } from "../../utils/id.util";

export interface MilestoneRecord {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  occurred_at: string;
  created_at: string;
}

export interface CreateMilestoneInput {
  category: string;
  title: string;
  description?: string;
  occurredAt?: string;
}

export const milestoneRepository = {
  create(userId: string, input: CreateMilestoneInput): MilestoneRecord {
    const id = generateId("milestone");
    db.prepare(
      `INSERT INTO milestones (id, user_id, category, title, description, occurred_at)
       VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now')))`
    ).run(id, userId, input.category, input.title, input.description ?? null, input.occurredAt ?? null);
    return this.findById(id)!;
  },

  findById(id: string): MilestoneRecord | undefined {
    return db.prepare("SELECT * FROM milestones WHERE id = ?").get(id) as MilestoneRecord | undefined;
  },

  findByIdForUser(id: string, userId: string): MilestoneRecord | undefined {
    return db
      .prepare("SELECT * FROM milestones WHERE id = ? AND user_id = ?")
      .get(id, userId) as MilestoneRecord | undefined;
  },

  delete(id: string, userId: string): boolean {
    const result = db.prepare("DELETE FROM milestones WHERE id = ? AND user_id = ?").run(id, userId);
    return result.changes > 0;
  },

  listForUser(userId: string): MilestoneRecord[] {
    return db
      .prepare("SELECT * FROM milestones WHERE user_id = ? ORDER BY occurred_at ASC")
      .all(userId) as MilestoneRecord[];
  },
};
