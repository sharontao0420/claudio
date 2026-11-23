# AGENTS.md

Rules for any coding agent in this repo (Claude Code, Cursor, Codex).

## What this is
- Claudio: a personal AI radio DJ. Node 22+, ES modules, no build step.
- Architecture: `docs/02-architecture.md`. Build order: `docs/roadmap.md`.

## Source of truth
- The output contract is `src/brain-output.schema.json`.
- If you change it, also update: `normalize()` in `src/claude.js`, `test/claude.test.js`, and the contract table in `docs/02-architecture.md`.

## Must
- `askBrain()` never throws. On failure it returns the fallback shape.
- Run `npm test` before every commit.
- Log each real choice in `docs/04-decisions.md`: date, choice, why.
- Keep docs in plain words and short bullets.
- Prefer Node built-ins (`node:sqlite`, `node:test`) over new dependencies.

## Never
- Never pass `--bare` to `claude`. It skips the subscription login.
- Never commit `user/`, `.env`, `state.db`, or `cache/`.
- Never read `meta/failures.md`. It's a human log, kept out of agent context.
