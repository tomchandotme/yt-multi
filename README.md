# yt-multi

Watch multiple YouTube streams in one grid. Paste URLs or video IDs, and the layout fills the viewport.

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
| `bun run build`        | Typecheck and build to `dist/`       |
| `bun run lint`         | Run oxlint                           |
| `bun run pages:deploy` | Build and deploy to Cloudflare Pages |
| `bun run pages:dev`    | Serve production build locally       |

## Deploy

Connect the repo in the Cloudflare Pages dashboard:

| Setting | Value |
| --- | --- |
| Build command | `bun run build` |
| Build output directory | `dist` |
| Environment variable | `BUN_VERSION=1.4.0` (required — default CF Bun 1.2.x cannot read `bun.lock` v2) |

Bun is pinned to 1.4.0 via `.bun-version`, `.tool-versions`, and `packageManager`. If the build still uses Bun 1.2.x, set `BUN_VERSION=1.4.0` under **Settings → Environment variables** and clear the build cache.

Or deploy from the CLI:

```bash
bunx wrangler login
bun run pages:deploy
```

## Project layout

```
src/
  App.tsx              # Root state and layout
  components/          # StreamBar, StreamGrid, YouTubeEmbed
  utils/
    youtube.ts         # URL / ID parsing
    layout.ts          # Grid sizing for 16:9 tiles
public/                # Static assets, SPA redirects
```
