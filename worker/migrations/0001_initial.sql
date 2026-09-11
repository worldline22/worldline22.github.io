CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('project','paper','note')),
  title TEXT NOT NULL,
  authors TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  organization TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
  position INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_entries_public ON entries(visibility,archived,position);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE oauth_states (state_hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, expires_at INTEGER NOT NULL);
