# yt-multi

Watch multiple YouTube videos and Twitch channels in one grid. Paste a link (or a YouTube video ID). The layout fills the leftover viewport with muted autoplay embeds.

The wall lives in this browser for 24 hours. There is no share URL and no backend.

## Stack

- React 19 + TypeScript + Vite
- Plain CSS (no UI framework)
- Cloudflare Pages via Wrangler

## Setup

```bash
bun install
bun run dev
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | Local dev server                     |
| `bun test`             | Bun unit tests                       |
| `bun run build`        | Typecheck and build to `dist/`       |
| `bun run lint`         | Run oxlint                           |
| `bun run pages:deploy` | Build and deploy to Cloudflare Pages |
| `bun run pages:dev`    | Serve production build locally       |

## Deploy

Connect the repo in the Cloudflare dashboard:

| Setting | Value |
| --- | --- |
| Build command | `bun run build` |
| Deploy command | `bun run deploy` or leave default `npx wrangler deploy` |
| Build output directory | `dist` (Pages git deploy only; Workers Builds uses deploy command) |
| Environment variable | `BUN_VERSION=1.4.0` (only if build still uses Bun 1.2.x) |

Workers Builds defaults deploy to `npx wrangler deploy`. `wrangler.jsonc` points that at `./dist` with SPA fallback.

Bun is pinned to 1.4.0 via `.bun-version`, `.tool-versions`, and `packageManager`.

Or deploy from the CLI:

```bash
bunx wrangler login
bun run pages:deploy
```

## Project layout

```
src/
  App.tsx                 # Streams and Names toggle
  components/             # StreamBar, StreamGrid, YouTubeEmbed, TwitchEmbed
  utils/
    stream.ts             # Stream type, parse, add, reorder
    youtube.ts            # YouTube ids and titles
    twitch.ts             # Twitch titles
    layout.ts             # 16:9 grid sizing
    storage.ts            # localStorage, 24h TTL
public/                   # favicon
```
