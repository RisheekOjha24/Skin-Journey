import { db } from "../connection";
import { generateId } from "../../utils/id.util";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const userRepository = {
  findByEmail(email: string): UserRecord | undefined {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as
      | UserRecord
      | undefined;
  },

  findById(id: string): UserRecord | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRecord | undefined;
  },

  create(input: { email: string; passwordHash: string; displayName: string }): UserRecord {
    const id = generateId("user");
    db.prepare(
      `INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`
    ).run(id, input.email.toLowerCase(), input.passwordHash, input.displayName);

    return this.findById(id)!;
  },

  markOnboardingComplete(userId: string): void {
    db.prepare(
      `UPDATE users SET onboarding_completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).run(userId);
  },
};
