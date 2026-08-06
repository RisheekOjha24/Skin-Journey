-- Skin Journey initial schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  onboarding_completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL DEFAULT 'weekly',
  image_path TEXT NOT NULL,
  overlay_image_path TEXT,
  overall_score REAL,
  metrics_json TEXT NOT NULL,
  raw_response_json TEXT,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scans_user_captured ON scans(user_id, captured_at);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_id TEXT REFERENCES scans(id) ON DELETE SET NULL,
  entry_date TEXT NOT NULL DEFAULT (datetime('now')),
  products_used TEXT,
  routine_morning TEXT,
  routine_evening TEXT,
  water_intake_liters REAL,
  sleep_hours REAL,
  diet_notes TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, entry_date);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_date ON milestones(user_id, occurred_at);

CREATE TABLE IF NOT EXISTS progress_summaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  scan_range_start TEXT NOT NULL,
  scan_range_end TEXT NOT NULL,
  scan_count INTEGER NOT NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_summaries_user ON progress_summaries(user_id, generated_at);
