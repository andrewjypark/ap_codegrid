# ap_codegrid

A multi-zone site collecting Andrew's Codegrid tutorial practice projects, published on Vercel at:

**https://ap-codegrid.vercel.app/**

## FAQ: why does this look like 4 separate apps instead of 1 website?

- **Is the content here, or just referenced from my other tutorial folders?** It's really here. Everything under tutorials/ was physically copied in (not symlinked, not a git submodule, no link back to the original folders). You can delete the original tutorial folders elsewhere on disk and this repo keeps working exactly as-is.
- **Why isn't this one Next.js app with shared routing?** Each tutorial has its own Next.js/React
  version and its own global CSS using bare, unscoped selectors (body, h1, section, etc).
  Loading two tutorials' CSS into one app lets one tutorial's styles silently override the
  other's (confirmed with a throwaway test build before choosing this structure). Separate apps
  means that collision can never happen, at the cost of 4 folders instead of 1.
- **Does it still deploy as one website?** Yes. The homepage and each tutorial zone are separate Vercel projects pointed at different folders in this same repo, and site/vercel.json rewrites each path prefix (/obsidian, /sticky-cards, etc.) to the matching zone's project - see Deployment below.

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
2. In each zone's next.config.mjs, add output: 'export', a basePath (/<name> for mine, /<name>/cg_example for cg_example), images.unoptimized: true, and trailingSlash: true. Keep any existing settings alongside these.
3. Create a new Vercel project for each zone (Root Directory set to that zone's folder), and add matching rewrite rules to site/vercel.json - cg_example's rules must come before its parent zone's catch-all rule, since rewrites match in order.
4. Add a link to site/index.html.

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
- obsidian - obsidian/mine, at http://localhost:3002/obsidian/
- obsidian-cg - obsidian/cg_example, at http://localhost:3012/obsidian/cg_example/
- sticky - sticky-cards/mine, at http://localhost:3000/sticky-cards/
- sticky-cg - sticky-cards/cg_example, at http://localhost:3010/sticky-cards/cg_example/

Open http://localhost:8080 and click a project link - the homepage detects it's running
locally and automatically points each link at that zone's dev server above, instead of the
production relative paths it uses once deployed. Stop everything with Ctrl+C.

Each zone runs on its own pinned Next.js version (via its own node_modules/.bin/next), so
this always matches what each zone's Vercel project actually builds - nothing here silently
runs a different Next.js version than the project expects.

## Deployment

5 Vercel projects, all pointed at this same GitHub repo (different "Root Directory" per project), each auto-deploying on every push to main:

| Vercel project | Root directory | basePath |
|---|---|---|
| ap-codegrid | site/ | *(none - domain root)* |
| ap-codegrid-obsidian | tutorials/obsidian/mine/ | /obsidian |
| ap-codegrid-obsidian-cg | tutorials/obsidian/cg_example/ | /obsidian/cg_example |
| ap-codegrid-sticky | tutorials/sticky-cards/mine/ | /sticky-cards |
| ap-codegrid-sticky-cg | tutorials/sticky-cards/cg_example/ | /sticky-cards/cg_example |

site/vercel.json routes requests to the right zone: each path prefix is rewritten to that zone's own `*.vercel.app` domain, keeping the full prefixed path (not stripped) so it lines up with that zone's basePath. The homepage project itself serves `/` directly - no rewrite needed there. Rule order matters: a cg_example rule must come before its parent zone's catch-all rule, or the catch-all would swallow it first.

No custom CI is needed - each Vercel project builds and redeploys itself automatically whenever this repo is pushed to main.
