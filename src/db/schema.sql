-- state.db — Claudio's memory. Survives restarts.
-- Create it with:  sqlite3 state.db < schema.sql
-- Times are ISO text in local time, e.g. '2026-10-23T16:05:00'.

PRAGMA journal_mode = WAL;     -- lets the server read and write at the same time
PRAGMA foreign_keys = ON;

-- What was said. User chat, DJ replies, scheduler and webhook triggers.
-- Feeds fragment ⑤ (input) and ⑥ (trace).
CREATE TABLE IF NOT EXISTS messages (
  id       INTEGER PRIMARY KEY,
  ts       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')),
  role     TEXT NOT NULL CHECK (role IN ('user', 'dj', 'system')),
  source   TEXT NOT NULL DEFAULT 'chat'
           CHECK (source IN ('chat', 'scheduler', 'webhook', 'router')),
  text     TEXT NOT NULL,
  brain    TEXT                  -- full {say, play[], reason, segue} JSON, for DJ rows
);
CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages(ts);

-- Every song that went out. Feeds fragment ④ (memory): "don't repeat", "she skipped this".
CREATE TABLE IF NOT EXISTS plays (
  id          INTEGER PRIMARY KEY,
  ts          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')),
  song_id     TEXT NOT NULL,      -- NetEase id
  title       TEXT NOT NULL,
  artist      TEXT NOT NULL,
  why         TEXT,               -- from play[].why
  outcome     TEXT NOT NULL DEFAULT 'played'
              CHECK (outcome IN ('played', 'skipped', 'liked', 'disliked')),
  message_id  INTEGER REFERENCES messages(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_plays_ts   ON plays(ts);
CREATE INDEX IF NOT EXISTS idx_plays_song ON plays(song_id);

-- Today's program. scheduler.js writes it at 07:00; GET /api/plan/today reads it.
CREATE TABLE IF NOT EXISTS plan (
  date     TEXT NOT NULL,         -- 'YYYY-MM-DD'
  slot     TEXT NOT NULL,         -- 'HH:MM', e.g. '09:00'
  theme    TEXT,                  -- e.g. 'morning show', 'focus', 'wind down'
  body     TEXT,                  -- JSON: notes, seed songs, mood
  status   TEXT NOT NULL DEFAULT 'planned'
           CHECK (status IN ('planned', 'aired', 'skipped')),
  PRIMARY KEY (date, slot)
);

-- Settings and learned likes. Key/value, value is JSON.
-- e.g. 'volume' → 35, 'speaker' → "Naim", 'quiet_hours' → ["23:00","07:00"]
CREATE TABLE IF NOT EXISTS prefs (
  key      TEXT PRIMARY KEY,
  value    TEXT NOT NULL,
  updated  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
);
