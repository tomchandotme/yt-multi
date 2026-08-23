# Agent notes

## What this is

A client-only SPA for watching multiple YouTube embeds in an auto-sized grid. No backend, no router, no state library.

## Layout

```
src/App.tsx                 # streams state
src/components/StreamBar.tsx   # URL input, chips
src/components/StreamGrid.tsx  # resize observer + grid
src/components/YouTubeEmbed.tsx
src/utils/youtube.ts        # parseYouTubeId()
src/utils/layout.ts         # computeOptimalLayout()
src/index.css               # theme tokens and styles
wrangler.jsonc              # Cloudflare Pages config
```

## Conventions

- Keep changes small. Match existing patterns: plain CSS classes, functional React components, no new dependencies unless asked.
- Styles live in `src/index.css`. Use existing CSS variables when theming.
- YouTube parsing belongs in `src/utils/youtube.ts`. Grid math belongs in `src/utils/layout.ts`.
- Build output is `dist/`. Do not commit `dist/` or `.wrangler/`.

## Commands

```bash
bun install
bun run dev
bun run build
bun run lint
bun run pages:deploy
```

## Deploy

- CI: `.github/workflows/deploy.yml` builds on push to `main` and runs `wrangler pages deploy`.
- Local deploy needs `wrangler login` first.
- SPA fallback is `public/_redirects`.

## Avoid

- Adding a router, API layer, or UI framework without being asked.
- Changing grid layout math unless fixing a real sizing bug.
- Committing secrets or Cloudflare credentials.
