import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { delimiter } from 'node:path';
import { parseBrainOutput, askBrain } from '../src/claude.js';

const envelope = (extra) => JSON.stringify({ type: 'result', is_error: false, result: '', ...extra });

// ── parseBrainOutput ──────────────────────────────────────────

test('reads structured_output and cleans it', () => {
  const out = parseBrainOutput(envelope({
    structured_output: {
      say: '  Good morning.  ',
      play: [
        { title: '晴天', artist: '周杰伦', why: 'sunny' },
        { title: '', artist: 'no title' },
      ],
      reason: 'sun is out',
      segue: 'next up',
    },
  }));
  assert.deepEqual(out, {
    say: 'Good morning.',
    play: [{ title: '晴天', artist: '周杰伦', why: 'sunny' }],
    reason: 'sun is out',
    segue: 'next up',
  });
});

test('falls back to result text, even inside ```json fences', () => {
  const out = parseBrainOutput(envelope({
    result: '```json\n{"say":"hi","play":[],"reason":"r","segue":""}\n```',
  }));
  assert.equal(out.say, 'hi');
  assert.deepEqual(out.play, []);
});

test('caps say length and play count', () => {
  const play = Array.from({ length: 15 }, (_, i) => ({ title: `t${i}`, artist: 'a' }));
  const out = parseBrainOutput(envelope({
    structured_output: { say: 'x'.repeat(2000), play, reason: '', segue: '' },
  }));
  assert.equal(out.say.length, 600);
  assert.equal(out.play.length, 10);
});

test('returns null on errors and junk', () => {
  assert.equal(parseBrainOutput(JSON.stringify({ is_error: true, result: 'auth failed' })), null);
  assert.equal(parseBrainOutput('garbage'), null);
  assert.equal(parseBrainOutput(''), null);
});

// ── askBrain, with a fake `claude` on PATH ────────────────────

const fakeBin = fileURLToPath(new URL('./fixtures/bin', import.meta.url));
process.env.PATH = fakeBin + delimiter + process.env.PATH;

test('askBrain sends context on stdin and uses the right flags', async () => {
  process.env.FAKE_CLAUDE_MODE = 'ok';
  const out = await askBrain('② taste: city pop');
  assert.equal(out.say, 'heard: ② taste: city pop');
  assert.equal(out.play[0].title, '晴天');

  const args = JSON.parse(out.reason);
  assert.ok(args.includes('-p'));
  assert.equal(args[args.indexOf('--output-format') + 1], 'json');
  assert.ok(args.includes('--json-schema'));
  assert.ok(args.includes('--system-prompt-file'));
  assert.equal(args[args.indexOf('--permission-mode') + 1], 'dontAsk');
  assert.ok(!args.includes('--bare'), 'never --bare: it skips the subscription login');
});

for (const mode of ['error', 'garbage']) {
  test(`askBrain never throws — ${mode}`, async () => {
    process.env.FAKE_CLAUDE_MODE = mode;
    const out = await askBrain('anything');
    assert.deepEqual(out.play, []);
    assert.equal(out.say, '');
    assert.match(out.reason, /^fallback — /);
  });
}

test('askBrain never throws — timeout', async () => {
  process.env.FAKE_CLAUDE_MODE = 'hang';
  const out = await askBrain('anything', { timeoutMs: 300 });
  assert.match(out.reason, /^fallback — /);
});
