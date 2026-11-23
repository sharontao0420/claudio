// claude.js — brain adapter
// Calls Claude Code as a subprocess. Uses your Max login, so no API key.
// Always returns { say, play[], reason, segue }. Never throws, so the radio keeps going.
//
// Needs: "type": "module" in package.json, and `claude` logged in on this machine.
// Do NOT add --bare: bare mode skips your subscription login and asks for an API key.

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SCHEMA = readFileSync(
  fileURLToPath(new URL('./brain-output.schema.json', import.meta.url)),
  'utf8'
);
const DEFAULT_PERSONA = fileURLToPath(new URL('../prompts/dj-persona.md', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

const MAX_SAY = 600;   // chars, roughly 60s of speech
const MAX_PLAY = 10;

// contextText = fragments ②–⑥ from context.js (taste, environment, memory, input, trace)
// personaFile = fragment ① (the DJ system prompt)
export function askBrain(contextText, {
  personaFile = DEFAULT_PERSONA,
  timeoutMs = 120_000,
} = {}) {
  return new Promise((resolve) => {
    const args = [
      '-p', 'You are Claudio. Read the context on stdin and reply.',
      '--output-format', 'json',
      '--json-schema', SCHEMA,
      '--system-prompt-file', personaFile,
      '--no-session-persistence',
      // The brain only talks. Anything that would need approval (shell, edits) is denied.
      '--permission-mode', 'dontAsk',
    ];

    const child = spawn('claude', args, { cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGINT'), timeoutMs);

    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => done(fallback(`spawn failed: ${e.message}`)));
    child.on('close', (code) => {
      const parsed = parseBrainOutput(out);
      done(parsed ?? fallback(`exit ${code}: ${err.slice(0, 200) || out.slice(0, 200)}`));
    });

    child.stdin.end(contextText);

    let finished = false;
    function done(result) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(result);
    }
  });
}

// Reads the JSON that `claude -p --output-format json` prints.
// With --json-schema the answer is in `structured_output`; `result` is the plain-text backup.
export function parseBrainOutput(stdout) {
  const envelope = tryJSON(stdout);
  if (!envelope || envelope.is_error === true) return null;
  const raw = envelope.structured_output ?? tryJSON(stripFences(envelope.result));
  return normalize(raw);
}

function normalize(o) {
  if (!o || typeof o !== 'object') return null;
  const play = Array.isArray(o.play) ? o.play : [];
  return {
    say: str(o.say).slice(0, MAX_SAY),
    play: play
      .filter((p) => p && str(p.title) && str(p.artist))
      .slice(0, MAX_PLAY)
      .map((p) => ({
        title: str(p.title),
        artist: str(p.artist),
        ...(p.id ? { id: String(p.id) } : {}),
        ...(p.why ? { why: str(p.why) } : {}),
      })),
    reason: str(o.reason),
    segue: str(o.segue),
  };
}

function fallback(why) {
  return { say: '', play: [], reason: `fallback — ${why}`, segue: '' };
}

function str(v) {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
}

function stripFences(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
}

function tryJSON(s) {
  if (typeof s !== 'string') return null;
  try { return JSON.parse(s); } catch { return null; }
}
