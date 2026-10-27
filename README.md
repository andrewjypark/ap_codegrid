# ap_codegrid

A multi-zone static site collecting Andrew's Codegrid tutorial practice projects, published to GitHub Pages at:

**https://andrewjypark.github.io/ap_codegrid/**

## Structure

Each tutorial lives under `tutorials/<name>/` as two completely independent Next.js apps:

- `mine/` - Andrew's own, ongoing practice version. This is the one he keeps editing.
- `cg_example/` - a fixed reference copy of the original Codegrid starter, left alone for comparison.

```
tutorials/
  obsidian/
    mine/
    cg_example/
  sticky-cards/
    mine/
    cg_example/
```

Each zone is a standalone app with its own package.json, node_modules, and next.config.mjs - nothing is shared between zones. This is deliberate ("multi-zone"): a dependency or CSS change in one tutorial can never break another, and adding a new tutorial later is just adding another isolated folder.

## Adding a new tutorial

1. Create tutorials/<name>/mine/ and tutorials/<name>/cg_example/, each a full copy of that tutorial's Next.js project (minus node_modules/.next).
2. In each zone's next.config.mjs, add output: 'export', a basePath (/ap_codegrid/<name> for mine, /ap_codegrid/<name>/cg_example for cg_example), images.unoptimized: true, and trailingSlash: true. Keep any existing settings alongside these.
3. Add both zones to scripts/build-all.sh.
4. Add a link to site/index.html.

## Building locally

Run ./scripts/build-all.sh

This runs npm install and npm run build in every zone, then merges each zone's static out/ export into one dist/ tree matching the site's final URL layout. Preview it with npx serve dist.

## Deployment

.github/workflows/deploy.yml runs scripts/build-all.sh on every push to main and publishes dist/ to GitHub Pages via actions/upload-pages-artifact plus actions/deploy-pages.

One-time setup after the first push: in the GitHub repo, go to Settings, then Pages, then Source, and select GitHub Actions.
