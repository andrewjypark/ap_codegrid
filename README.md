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

### Setting up Vercel for this project, step by step

This is the exact recipe used to stand this up, and the same steps to follow when adding a new zone later.

**Prerequisites (one-time, per machine):**

```
npm install -g vercel
vercel login
```

`vercel login` opens a browser to sign in (or create a free Hobby account). This is the only
step that needs a human at the keyboard - everything else below can be scripted/automated.

**For each zone (homepage included), from inside that zone's own folder:**

```
cd tutorials/obsidian/mine          # or site/, or any other zone folder
vercel link --yes --project ap-codegrid-obsidian
vercel --prod
```

- `vercel link --yes --project <name>` creates a new Vercel project with that exact name (so its
  default domain is predictably `<name>.vercel.app`), links the current folder to it, and - because
  this folder is inside a git repo with a GitHub remote - automatically connects that GitHub repo
  to the project too. That connection is what gives you auto-deploy-on-push; nothing extra is
  needed to wire that up.
- `vercel --prod` does the first production deploy and prints the final `https://<name>.vercel.app`
  URL once it's ready (usually well under a minute for one of these zones).
- **Important:** despite what you might expect, `vercel link` does *not* reliably set that
  project's "Root Directory" (which subfolder of the repo it should build from on every push) -
  in practice it came back `null` for every project set up this way. Set it explicitly right after
  linking, either in the Vercel dashboard (Project Settings -> General -> Root Directory) or via
  the API:
  ```
  curl -X PATCH "https://api.vercel.com/v9/projects/<project-name>?teamId=<team-id>" \
    -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
    -d '{"rootDirectory":"tutorials/obsidian/mine"}'
  ```
  (`<token>` is in the local Vercel CLI's own auth file, e.g.
  `~/Library/Application Support/com.vercel.cli/auth.json` on macOS.) Skipping this means a future
  git push will try to build the whole repo root as that project, which will build the wrong thing
  or fail outright - the one-off CLI deploy from this folder will still have worked, masking the
  problem until the first auto-deploy from a push.

**Picking project names:** choose the name *before* running `vercel link`, since it determines the
project's domain, and that domain is what goes into `site/vercel.json`'s rewrite rules (see
Deployment above). Keep names unique and predictable (`ap-codegrid-<zone>`) so you never have to
guess or look up a domain after the fact.

**Verifying a zone works on its own**, before wiring it into the homepage's rewrites:

```
curl -s -o /dev/null -w "%{http_code}\n" https://ap-codegrid-obsidian.vercel.app/obsidian/
```

Should return `200`. The bare domain root (no basePath) correctly returns `404` - that's expected,
not a bug, since the app only serves paths under its configured `basePath`.

**Confirming continuous deployment is actually wired up:** push any commit to `main` and check
that project's **Deployments** tab in the Vercel dashboard (or `vercel ls <project-name>`) for a
new deployment triggered by that push, not just the one-off CLI deploy from setup.

**Adding a brand new tutorial zone later:** repeat the "For each zone" steps above for its `mine/`
and `cg_example/` folders (including the Root Directory fix above), add its rewrite rules to
`site/vercel.json` (remember: more specific paths like `cg_example` must come before their parent
zone's catch-all rule), then redeploy the homepage project (`cd site && vercel --prod`) so the new
rewrites take effect.

### Two Vercel/Next.js gotchas worth knowing about

These cost real debugging time when this was first set up - worth reading before touching the
routing or basePath config again.

**1. A `vercel.json` rewrite rule using a wildcard (`:match*`) can silently fail on an exact
trailing-slash match.** `site/vercel.json` needs *three* rules per zone, not two - a bare path, a
trailing-slash exact match, and the wildcard for anything deeper:

```json
{ "source": "/obsidian", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian" },
{ "source": "/obsidian/", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/" },
{ "source": "/obsidian/:match*", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/:match*" }
```

Without the middle rule, a request for `/obsidian/` (trailing slash, nothing after it) returns a
platform `404 NOT_FOUND` even though the exact same destination URL works fine when hit directly,
and even though `/obsidian/<anything>` through the same wildcard rule works fine. The wildcard
rule's destination template apparently mishandles the case where `:match*` matches zero segments.
A literal, non-wildcard rule for that one exact path sidesteps it entirely.

**2. Vercel's automatic basePath routing for a statically-exported Next.js app is inconsistent
across Next.js major versions.** On Next 16 it just works: hitting a project's own domain at its
basePath (e.g. `/obsidian/`) correctly resolves to the page and its `_next` assets, even though
those files physically live at the output root (`out/index.html`, `out/_next/...`), not nested
under a `sticky-cards/`-style folder. On Next 15, that same automatic resolution does not reliably
happen - the page and its `_next` assets 404 even hitting the project's own domain directly, no
proxying involved. Rather than depend on that undocumented, version-dependent platform behavior,
the `sticky-cards/mine` and `sticky-cards/cg_example` zones (both on Next 15) run a small
post-build script (`scripts/mirror-basepath.mjs`, wired into `npm run build`) that physically
copies the exported output into a basePath-matching subfolder, so every basePath-prefixed path the
HTML actually references exists as a real file on disk regardless of what Vercel's framework
detection does with it. If a future zone ends up on Next 15 (or this breaks again on some other
Next version), copy that script and add `&& node scripts/mirror-basepath.mjs` to its `build`
script rather than re-debugging this from scratch.

### Keeping Next.js patched

Vercel's deploy pipeline actively blocks deployment of known-vulnerable Next.js versions on
Hobby/Pro plans - one of the sticky-cards zones got hard-blocked this way when its Next.js version
fell behind. Check `npm audit` after bumping; the minimum version that clears a given CVE batch
per Next's own advisories isn't always the same as the minimum version `npm audit` is satisfied
with, since npm's advisory database tracks separate, sometimes more recent, CVEs.
