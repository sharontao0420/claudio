// Creates state.db from src/db/schema.sql. Safe to run again.
// Usage: npm run db:init  [path]   (default: ./state.db)

import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const schema = readFileSync(
  fileURLToPath(new URL('../src/db/schema.sql', import.meta.url)),
  'utf8'
);
const path = process.argv[2] ?? 'state.db';

const db = new DatabaseSync(path);
db.exec(schema);
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all()
  .map((r) => r.name);
db.close();

console.log(`${path} ready: ${tables.join(', ')}`);
