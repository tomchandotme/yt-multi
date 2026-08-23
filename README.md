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

Pushes to `main` deploy automatically via GitHub Actions.

Required repo secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Manual deploy:

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
