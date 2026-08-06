import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env";

const dbDir = path.dirname(env.DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(env.DATABASE_PATH);

// Sensible production pragmas for a single-writer SQLite deployment.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

export function closeDb(): void {
  db.close();
}
