# 04 · Decisions

Short log. Newest at the bottom.

### 2026-10-23 · Lock the output with a schema
- **Choice:** pass `--json-schema` to `claude -p`.
- **Why:** Claude Code checks the answer before returning it. The answer lands in `structured_output`.
- **Backup:** if `structured_output` is missing, parse `result` as JSON.

### 2026-10-23 · Don't use `--bare`
- **Choice:** call `claude -p` without `--bare`.
- **Why:** bare mode skips the subscription login and needs an API key.

### 2026-10-23 · The brain never crashes
- **Choice:** `askBrain()` always returns the output shape. On any failure: empty `say`, empty `play`, reason starts with `fallback —`.
- **Why:** the radio keeps playing even if Claude is slow or down.

### 2026-10-23 · SQLite for memory
- **Choice:** one `state.db` file, 4 tables, WAL mode.
- **Why:** one file, survives restarts, server can read while it writes.

### 2026-10-27 · The brain can't run tools
- **Choice:** `--permission-mode dontAsk`, run from the repo root.
- **Why:** the brain only needs to talk. Shell and edits are denied.

### 2026-10-27 · Taste files stay private
- **Choice:** `user/` is git-ignored. `user.example/` holds templates.
- **Why:** listening history is personal.
