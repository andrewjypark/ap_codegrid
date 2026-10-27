# ap_codegrid

A multi-zone static site collecting Andrew's Codegrid tutorial practice projects, published to GitHub Pages at:

**https://andrewjypark.github.io/ap_codegrid/**

## FAQ: why does this look like 4 separate apps instead of 1 website?

- **Is the content here, or just referenced from my other tutorial folders?** It's really here. Everything under tutorials/ was physically copied in (not symlinked, not a git submodule, no link back to the original folders). You can delete the original tutorial folders elsewhere on disk and this repo keeps working exactly as-is.
- **Why isn't this one Next.js app with shared routing?** Each tutorial has its own Next.js/React
  version and its own global CSS using bare, unscoped selectors (body, h1, section, etc).
  Loading two tutorials' CSS into one app lets one tutorial's styles silently override the
  other's (confirmed with a throwaway test build before choosing this structure). Separate apps
  means that collision can never happen, at the cost of 4 folders instead of 1.
- **Does it still deploy as one website?** Yes. scripts/build-all.sh builds each zone separately, then merges their static output into one dist/ folder that becomes the one live site at the URL above.

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

Each zone is a standalone app with its own package.json, node_modules, and next.config.mjs - nothing is shared between zones.

## Adding a new tutorial

1. Create tutorials/<name>/mine/ and tutorials/<name>/cg_example/, each a full copy of that tutorial's Next.js project (minus node_modules/.next).
2. In each zone's next.config.mjs, add output: 'export', a basePath (/ap_codegrid/<name> for mine, /ap_codegrid/<name>/cg_example for cg_example), images.unoptimized: true, and trailingSlash: true. Keep any existing settings alongside these.
3. Add both zones to scripts/build-all.sh.
4. Add a link to site/index.html.

## Building locally

Run ./scripts/build-all.sh

This runs npm install and npm run build in every zone, then merges each zone's static out/ export into one dist/ tree matching the site's final URL layout. Preview it with npx serve dist.

## Local development (live-reloading dev servers)

For day-to-day work you don't need to build anything - the root package.json runs the
homepage and all four tutorial dev servers together, each with live reload.

First time only:

```
npm run setup
```

This installs dependencies at the root and in every tutorial zone (5 npm installs total).

Then, any time you want to work on the site:

```
npm run dev
```

This starts 5 processes at once (via concurrently), each in its own labeled, colored log line:

- site - the homepage, at http://localhost:8080
- obsidian - obsidian/mine, at http://localhost:3002/ap_codegrid/obsidian/
- obsidian-cg - obsidian/cg_example, at http://localhost:3012/ap_codegrid/obsidian/cg_example/
- sticky - sticky-cards/mine, at http://localhost:3000/ap_codegrid/sticky-cards/
- sticky-cg - sticky-cards/cg_example, at http://localhost:3010/ap_codegrid/sticky-cards/cg_example/

Open http://localhost:8080 and click a project link - the homepage detects it's running
locally and automatically points each link at that zone's dev server above, instead of the
production relative paths it uses once deployed. Stop everything with Ctrl+C.

Each zone runs on its own pinned Next.js version (via its own node_modules/.bin/next), so
this always matches what scripts/build-all.sh and GitHub Actions actually build - nothing
here silently runs a different Next.js version than the project expects.

## Deployment

.github/workflows/deploy.yml runs scripts/build-all.sh on every push to main and publishes dist/ to GitHub Pages via actions/upload-pages-artifact plus actions/deploy-pages.

One-time setup after the first push: in the GitHub repo, go to Settings, then Pages, then Source, and select GitHub Actions.
