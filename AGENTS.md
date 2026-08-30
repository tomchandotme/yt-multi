# Agent notes

## What this is

A client-only SPA for a live wall of YouTube and Twitch embeds in an auto-sized 16:9 grid. Paste a YouTube URL or 11-character id, or a `twitch.tv/{channel}` URL. No backend, no router, no state library.

`App.tsx` holds `Stream[]` and the Names toggle. Persistence is `localStorage` (`yt-multi:streams`, 24h TTL, v2 `{ v, streams, savedAt }`). Labels pin is `yt-multi:labels-pinned`.

## Layout

```
src/App.tsx                    # streams state, save effects
src/components/StreamBar.tsx   # paste, Names, Clear
src/components/StreamGrid.tsx  # resize observer, tiles, reorder
src/components/YouTubeEmbed.tsx
src/components/TwitchEmbed.tsx
src/utils/stream.ts            # Stream, parseStream, addStream, moveStream
src/utils/youtube.ts           # parseYouTubeId, fetchVideoTitle
src/utils/twitch.ts            # fetchTwitchTitle
src/utils/layout.ts            # computeOptimalLayout
src/utils/storage.ts           # load/save streams and labels
src/index.css                  # theme tokens and styles
wrangler.jsonc                 # Cloudflare assets config
```

Tests sit next to the modules they cover (`*.test.ts`). CI runs oxlint, `bun test`, and `bun run build`.

## Conventions

- Keep changes small. Match existing patterns: plain CSS classes, functional React components, no new dependencies unless asked.
- Styles live in `src/index.css`. Use existing CSS variables when theming.
- `Stream` is `{ kind: "youtube" | "twitch"; id: string }`. Parse and identity live in `src/utils/stream.ts`.
- YouTube ids and oEmbed titles belong in `src/utils/youtube.ts`. Twitch channel parse stays in `stream.ts`. Twitch titles belong in `src/utils/twitch.ts`.
- Grid math belongs in `src/utils/layout.ts`. Pass `chromeHeight` (the 28px name strip) so the **player** stays 16:9. Do not shrink the iframe after layout.
- Build output is `dist/`. Do not commit `dist/` or `.wrangler/`.

## Commands

```bash
bun install
bun run dev
bun test
bun run build
bun run lint
bun run pages:deploy
```

## Deploy

- Cloudflare Workers Builds: build command `bun run build`. Deploy uses `wrangler.jsonc` assets config (`npx wrangler deploy` or `bun run deploy`).
- Cloudflare Pages (git): build command `bun run build`, output directory `dist`.
- CLI: `wrangler login` then `bun run pages:deploy`.
- SPA fallback is `assets.not_found_handling: "single-page-application"` in `wrangler.jsonc`. Do not add `public/_redirects` with `/* /index.html 200`. Workers treats that as an infinite loop.

## Avoid

- Adding a router, API layer, or UI framework without being asked.
- Changing grid layout math unless fixing a real sizing bug.
- Re-adding Bilibili or other hosts without being asked.
- Committing secrets or Cloudflare credentials.
