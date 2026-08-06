import fs from "node:fs";
import path from "node:path";
import { db } from "./connection";

/**
 * Minimal, dependency-free migration runner.
 * Applies every .sql file in ./migrations exactly once, tracked in a
 * `schema_migrations` table, in filename order.
 */
function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const alreadyApplied = new Set(
    db
      .prepare("SELECT name FROM schema_migrations")
      .all()
      .map((row: any) => row.name)
  );

  for (const file of files) {
    if (alreadyApplied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const applyMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(file);
    });

    applyMigration();
    console.log(`✅ Applied migration: ${file}`);
  }
}

runMigrations();

export { runMigrations };
