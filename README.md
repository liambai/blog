# Repo for Liam's blog

[![Netlify Status](https://api.netlify.com/api/v1/badges/059ed4ed-596f-4886-b305-dda4a2e9d4b5/deploy-status)](https://app.netlify.com/sites/liambai/deploys)

https://liambai.com/

Built with [Astro](https://astro.build/). Posts live in `content/blog/<slug>/index.mdx`,
colocated with their images and visualization components (d3 + Mol\* React islands).

### Run locally

Works with node v22+ and [pnpm](https://pnpm.io/).

```
pnpm install
pnpm dev
```

### Build

```
pnpm build
```

Preview the production build with `pnpm preview`.

### Testing locally

The dev server and the production build resolve modules differently, so a page
can work in one and break in the other. Smoke-test both — each boots a server
and fetches every route, failing on SSR errors or missing content:

```
pnpm smoke       # builds, then checks the production (preview) server
pnpm smoke:dev   # checks the dev server
```
