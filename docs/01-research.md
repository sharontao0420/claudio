# 01 · Research

## Where the idea came from

- A Douyin post by **@mmguo**: "把我十四年的歌单，蒸馏成了AI电台" — "I distilled 14 years of playlists into an AI radio."
- Tags: #vibecoding #aigc.
- The video shows a one-page build plan, titled "截图给 Claude Code 看" — "screenshot this for Claude Code."
- All credit for the idea and the original blueprint goes to @mmguo.

## Demand signal

Counts on the post when I saved it:

| Likes | Saves | Shares | Comments |
|---|---|---|---|
| 58K | 27K | 18K | 1,384 |

- Saves are almost half of likes. Many viewers kept it to come back to.

## What the blueprint gives

- 4 layers: inputs → local brain → context window → interface.
- 6 modules: `router.js`, `context.js`, `claude.js`, `scheduler.js`, `tts.js`, `state.db`.
- 6 context pieces glued into one prompt on every trigger.
- One output shape: `{say, play[], reason, segue}`.
- 3 app views: Player, Profile, Settings.
- 6 HTTP lines between app and server. 4 are readable. 2 are hidden under the video subtitle.

## What the blueprint leaves out

- 2 of the 6 endpoints.
- What goes in the taste files.
- The DJ's persona prompt.
- Any screen design.

## Dependency check · 2026-10-27

**Claude Code (the brain)**
- `claude -p` runs one prompt and exits.
- The blueprint says `--output json`. The real flag is `--output-format json`.
- `--json-schema` makes Claude Code check the answer. The answer lands in `structured_output`.
- `--bare` skips the subscription login and needs an API key. So: don't use it.
- Sources: [CLI reference](https://code.claude.com/docs/en/cli-reference.md) · [Run programmatically](https://code.claude.com/docs/en/headless.md)

**NeteaseCloudMusicApi (the music)**
- The original GitHub repo was emptied for copyright reasons in January 2024.
- It was archived on April 16, 2024. Read-only now.
- The npm package `NeteaseCloudMusicApi` is still published (v4.32.0, updated May 2026).
- Risk: no official upstream. Not yet tested from the US.
- Sources: [GitHub repo](https://github.com/Binaryify/NeteaseCloudMusicApi) · [IT之家](https://www.ithome.com/0/746/942.htm)

**Fish Audio (the voice)**
- Pay as you go. Billed per million UTF-8 bytes.
- `s2-pro`: $15 per million bytes. A free model, `s2.1-pro-free`, exists.
- Chinese characters take 3 bytes each, so Chinese lines cost more than English ones.
- Source: [Fish Audio pricing](https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits)

**The rest of mmguo's setup**
- Feishu (calendar), weather, UPnP to a Naim amp.
- These are one person's home setup. Each one is a swap point.

## Still open

- Does NetEase return playable links from the US?
- Which calendar and which speaker?
- Is the browser alone enough as the speaker for v1?
