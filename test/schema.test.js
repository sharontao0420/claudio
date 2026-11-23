import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');

function freshDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(read('../src/db/schema.sql'));
  return db;
}

test('creates the 4 tables', () => {
  const tables = freshDb()
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((r) => r.name);
  assert.deepEqual(tables, ['messages', 'plan', 'plays', 'prefs']);
});

test('a DJ message and its plays link up', () => {
  const db = freshDb();
  const { lastInsertRowid } = db
    .prepare("INSERT INTO messages (role, source, text) VALUES ('dj', 'scheduler', 'Good morning')")
    .run();
  db.prepare("INSERT INTO plays (song_id, title, artist, message_id) VALUES ('186016', '晴天', '周杰伦', ?)")
    .run(lastInsertRowid);

  const row = db.prepare('SELECT outcome, message_id, ts FROM plays').get();
  assert.equal(row.outcome, 'played');
  assert.equal(row.message_id, lastInsertRowid);
  assert.match(row.ts, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
});

test('blocks bad values', () => {
  const db = freshDb();
  assert.throws(() => db.prepare("INSERT INTO plays (song_id, title, artist, outcome) VALUES ('1', 'a', 'b', 'meh')").run(), /CHECK/);
  assert.throws(() => db.prepare("INSERT INTO messages (role, text) VALUES ('robot', 'x')").run(), /CHECK/);
});

test('one plan row per date + slot', () => {
  const db = freshDb();
  const add = db.prepare("INSERT INTO plan (date, slot, theme) VALUES ('2026-10-27', '09:00', ?)");
  add.run('morning show');
  assert.throws(() => add.run('again'), /UNIQUE|PRIMARY/);
});

test('the output contract is valid JSON with the 4 required fields', () => {
  const schema = JSON.parse(read('../src/brain-output.schema.json'));
  assert.deepEqual(schema.required, ['say', 'play', 'reason', 'segue']);
});
