CREATE TABLE IF NOT EXISTS learner_progress (
  owner_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  revision INTEGER NOT NULL CHECK (revision >= 1),
  progress_json TEXT NOT NULL CHECK (length(progress_json) <= 512000),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS learner_progress_updated_at
  ON learner_progress(updated_at);
