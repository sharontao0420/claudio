# 03 · Design

The blueprint names 3 views and nothing else. This is where the design work goes.

## Goal

- A radio, not a chatbot.
- It talks first. You can talk back.

## Views

### Player
- Now playing: title, artist, cover.
- Why this song: `play[].why`.
- What the DJ just said: `say`.
- Up next: the queue.
- Talk back: chat box.
- Controls: skip, like, pause.

### Profile
- Your taste, as Claudio sees it.
- Routines and mood rules.
- Recent plays, likes, skips.

### Settings
- Speaker.
- Voice.
- Quiet hours.
- Volume.

## UI ↔ data map

What each element needs, and where it comes from.

| UI element | Data | Source |
|---|---|---|
| Now playing | `title`, `artist` | `GET /api/now`, `WS /stream` |
| "Why this song" | `play[].why` | `WS /stream` |
| DJ line | `say` | `WS /stream` |
| Up next | queue | `GET /api/now` |
| Today's show | plan slots | `GET /api/plan/today` |
| Taste summary | taste files | `GET /api/taste` |
| Chat | your text | `POST /api/chat` (likely) |
| Like / skip | `plays.outcome` | endpoint TBD |
| Settings | `prefs` table | endpoint TBD |

## Open design questions

- Is the voice the main interface, or the screen?
- Where does "today's show" live: Player or Profile?
- How does Claudio look when it's quiet?
- How do you show "why this song" without clutter?
- Text, voice, or buttons to talk back?

## Figma

- Link: _to add_
