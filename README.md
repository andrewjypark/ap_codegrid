# ap_codegrid

A multi-zone site collecting Andrew's Codegrid tutorial practice projects, published on Vercel at:

**https://ap-codegrid.vercel.app/**

## How this is put together (read this first)

**The big idea:** this isn't one website - it's a thin homepage plus several completely
independent Next.js apps, stitched together at the hosting layer so they *look* like one site.
Each Codegrid tutorial gets copied into the repo twice: once as an ongoing practice version, once
as a frozen copy of the original starter for comparison. Nothing is shared between them - no
shared components, no shared CSS, no shared `node_modules`. The only things unifying them are a
homepage that links to each one, and a routing rule that proxies each path prefix to the right
deployment. See the FAQ right below for why it's built this way instead of as one shared app.

**How that plays out in the repo:**

```
site/              -> the homepage: static index.html + vercel.json (the routing glue)
tutorials/
  <tutorial-name>/
    mine/           -> your ongoing practice version, a full standalone Next.js app
    cg_example/     -> frozen copy of the original Codegrid starter
```

Each `mine/`/`cg_example/` folder is a real, complete Next.js project with its own
`package.json`, `node_modules`, and pinned Next.js version. The only things its `next.config.mjs`
adds beyond a normal Next app are `output: 'export'` (static HTML, no server needed), `basePath`
(so the app knows it lives at e.g. `/obsidian` and not the domain root - see "What is basePath"
below if that's unfamiliar), and `trailingSlash: true`.

On the hosting side, each of those folders is its own separate Vercel project, all pointed at the
same GitHub repo via a per-project "Root Directory" setting, each redeploying itself automatically
on every push. `site/vercel.json` is what makes it feel like one domain: a request for
`/obsidian/threshold/` gets reverse-proxied to `ap-codegrid-obsidian.vercel.app/obsidian/threshold/`
behind the scenes, and the visitor never sees that second domain. Full details in Deployment below.

Locally, the root `package.json` is purely a convenience layer - `npm run setup` installs every
zone's dependencies, `npm run dev` runs every zone's dev server at once (via `concurrently`), and
`site/index.html` swaps its links to `localhost` URLs when it detects it's running locally. None
of this root-level tooling is involved in production at all.

**What "basePath" actually is**, since it comes up constantly in this README: it's a Next.js
config option that tells the framework "this app isn't living at the root of its domain, it's
living under this subpath instead." Next then automatically carries that prefix through
everything it generates itself - page routes, `_next` asset URLs, `next/link` hrefs, `next/image`
srcs. What it does *not* do is touch anything hand-written that isn't going through Next's own
APIs - a literal string in CSS, or a library that reads a resolved DOM attribute instead of the
original route. Both of those gaps caused real bugs in this repo (see Gotcha 0 in Deployment, and
the background-image fix in git history) - anything added to a zone that isn't plain Next.js
markup/routing needs a manual check for whether it accounts for `basePath` on its own.

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
5. **If the zone uses a page-transition library (anything that intercepts `<a>` clicks to animate between routes), read "Gotcha 0" below before wiring up its nav links.** This bit a real zone in this repo and the symptom looks exactly like a routing/hosting bug, but it isn't one.
6. **For every actual page the zone has (not just its root), add an explicit literal rewrite rule pair to `site/vercel.json`** - see "Gotcha 1" below for why the wildcard catch-all alone is not enough, and follow its pattern exactly.

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

**Note:** Gotcha 0 below (the nav-link 404 bug) reproduces in local dev too, since `basePath` is
part of each zone's `next.config.mjs` regardless of where it's served from - it's not a
production-only or Vercel-only issue. If clicking a nav link locally lands on a 404, check Gotcha
0 before assuming it's a dev-server quirk.

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
- **Also important:** once a project's Root Directory is set (per the previous point), running
  `vercel --prod` again from inside that zone's own folder will fail with `Error: The specified
  Root Directory "<path>" does not exist` - because the CLI only uploads the current working
  directory's contents as the deploy source, and that no longer contains the nested subfolder
  structure Root Directory expects. From then on, deploy from the **repo root** instead, passing
  the target project explicitly via env vars (read from that zone's own `.vercel/project.json`):
  ```
  cd /path/to/ap_codegrid
  VERCEL_ORG_ID=<orgId> VERCEL_PROJECT_ID=<projectId> vercel --prod --yes
  ```
  Vercel then applies the Root Directory setting server-side to pick the right subfolder out of
  the full repo upload.

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
and `cg_example/` folders (including the Root Directory fix above). If the zone has a page
transition library wired to its nav links, fix it per Gotcha 0 below before testing anything else
- a 404 on a nav-link click will otherwise send you hunting through `vercel.json` for a bug that
isn't there. Then add its rewrite rules to `site/vercel.json` following Gotcha 1 below exactly: a
literal rule pair for every actual page the zone has, plus the root and wildcard rules, with
cg_example's block coming before its parent zone's. Redeploy the homepage project (`cd site &&
vercel --prod`) so the new rewrites take effect, then curl every page of the new zone through the
homepage domain (not just its own `*.vercel.app` domain) before calling it done - see the
verification snippet at the end of Gotcha 1. Finally, click through the nav links in an actual
browser (not just curl) - curl only proves the server-side route resolves; it can't catch Gotcha
0, which is a client-side-only bug that curl never sees.

### Gotcha 0 (read this first - it's the one that actually caused the reported bug): clicking a nav link 404s because a page-transition library doubles `basePath` on client-side navigation

**This is what was actually happening when clicking "Threshold", "Sanctum", or "Genesis" on the
`obsidian` zone produced a 404 - and it has nothing to do with Vercel, rewrites, or hosting at
all.** It reproduces identically on `localhost`, on the zone's own direct `*.vercel.app` domain,
and through the homepage proxy. Gotcha 1 below (the cross-project rewrite limitation) is a real,
separate issue, and fixing it was necessary but **not sufficient** - it only fixes a hard
reload/direct URL visit, not a click.

**Root cause:** both `obsidian/mine` and `obsidian/cg_example` use the
[`next-transition-router`](https://www.npmjs.com/package/next-transition-router) package to
animate between pages (`TransitionProvider.jsx`), with its `<TransitionRouter auto>` prop
enabled. In `auto` mode, the library attaches its own delegated click listener to the whole page
and, for every internal link click, reads the clicked anchor's **live DOM `href` attribute**
(`link.getAttribute("href")`) and passes that string straight into Next.js's own router (ultimately
`router.push()` from `next/navigation`).

The problem: a Next.js `<Link href="/threshold">` renders its DOM `href` attribute as the FULLY
RESOLVED, basePath-prefixed path (`/obsidian/threshold/`), because that's what the browser needs
to navigate correctly on a hard click. But Next's own `router.push()` always treats whatever path
you give it as basePath-RELATIVE and prepends `basePath` itself. So: the already-prefixed
`/obsidian/threshold/` goes into `router.push()`, which prepends `/obsidian` again, producing
`/obsidian/obsidian/threshold/` - which doesn't exist, hence the 404. Confirmed directly via the
browser's network tab: clicking Threshold fires a correct RSC payload fetch to
`/obsidian/threshold/__next.threshold.__PAGE__.txt` (200), immediately followed by the actual
navigation request to `/obsidian/obsidian/threshold/index.txt` (404) - the doubled segment is
visible right there in the request URL.

This only surfaces because this repo sets a non-empty `basePath` for every zone (needed for the
multi-zone URL structure - see Structure above). The original, unmodified Codegrid tutorial never
sets a `basePath`, so `auto` mode never doubles anything there - doubling an empty string does
nothing. In other words: this bug was latent in the tutorial code from the start, and adding
`basePath` for deployment is what woke it up. Any future zone that reuses this transition-library
pattern WILL hit this the moment a `basePath` is added, regardless of hosting platform.

**The fix:** `next-transition-router`'s own exported `Link` component (as opposed to its `auto`
click-delegation mode) takes its target from the `href` PROP you pass it, not from the rendered
DOM attribute - so it never re-reads an already-prefixed value. Swap to that, and turn `auto` off:

1. In `TransitionProvider.jsx`, remove the `auto` prop from `<TransitionRouter>`.
2. In `Navbar.jsx` (or wherever the zone's nav links live), replace:
   ```jsx
   import Link from "next/link";
   ```
   with:
   ```jsx
   import { Link } from "next-transition-router";
   ```
   No other code changes needed - it's a drop-in replacement with the same `href`/children API.

Applied to both `obsidian/mine` and `obsidian/cg_example` (the only two files per zone involved:
`src/components/Navbar.jsx` and `src/providers/TransitionProvider.jsx`). Verified by actually
clicking Threshold, Sanctum, and Genesis in a real browser against the deployed site, both
directly and through the homepage proxy - not just curl, since curl can't exercise client-side
navigation at all and would show this as "already fixed" even while it was still broken.

**If a future zone uses this library (or any other link-interception-based transition library)
with a non-empty `basePath`:** check whether its "automatic"/global click-interception mode reads
the DOM `href` attribute versus the original route prop. If it reads the DOM attribute, it will
double the basePath the same way. Either use that library's own transition-aware `Link` component
instead of plain `next/link`, or call its programmatic `push()`/`navigate()` API directly with the
basePath-relative path (not the resolved one) from an `onClick` handler, with `auto` off.

### Gotcha 1: a wildcard rewrite cannot proxy a page route to another Vercel project - only a literal rule can

This is a real, separate issue from Gotcha 0 above, discovered while investigating what turned out
to be a red herring for the original bug report - but it's still worth fixing, since it affects
hard reloads, directly-typed/bookmarked URLs, and anything that doesn't go through client-side
navigation.

A `vercel.json` rewrite whose source uses a wildcard (`:match*`) and whose destination is
ANOTHER Vercel project's domain works for a static asset (`/obsidian/_next/static/chunks/xyz.js`
proxies and resolves fine) but silently 404s for an actual **page route** one or more segments
deep (`/obsidian/threshold/` proxies to a Vercel platform `NOT_FOUND`, even though the exact same
URL returns 200 when hit directly on that zone's own `*.vercel.app` domain). This was confirmed
across every zone in this repo, both Next 15 and Next 16, both app router zones (obsidian) and the
simpler sticky-cards zones - it is a general limitation of cross-project wildcard rewrites, not
specific to any Next.js version or router.

The tell: the failing response is a Vercel **platform** 404 (`content-type: text/plain`, body
`NOT_FOUND`, a single-hop `x-vercel-id`), not a Next.js app-level 404 page (which would be styled
HTML with a multi-hop `x-vercel-id` like `sfo1:sfo1:sfo1::...` - compare against a working proxied
request to a zone's root to see that multi-hop pattern). That means the request fails during the
proxy forward itself, before it ever reaches the destination app.

**The fix:** add an explicit, literal (non-wildcard) rewrite rule pair - one without a trailing
slash, one with - for every actual page route in the zone, not just its root. Keep the wildcard
rule too (it's still needed for `_next` assets, images, and anything else that isn't a page), but
list the literal page rules before it so they match first:

```json
{ "source": "/obsidian/threshold", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/threshold" },
{ "source": "/obsidian/threshold/", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/threshold/" },
{ "source": "/obsidian/sanctum", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/sanctum" },
{ "source": "/obsidian/sanctum/", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/sanctum/" },
{ "source": "/obsidian/ap", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/ap" },
{ "source": "/obsidian/ap/", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/ap/" },
{ "source": "/obsidian", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian" },
{ "source": "/obsidian/", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/" },
{ "source": "/obsidian/:match*", "destination": "https://ap-codegrid-obsidian.vercel.app/obsidian/:match*" }
```

This is the actual current content of `site/vercel.json` - every page in every zone (obsidian,
obsidian/cg_example, sticky-cards, sticky-cards/cg_example) has its own literal rule pair. **The
real implication: every time a page is added to or removed from any zone, `site/vercel.json` needs
a matching rule added or removed, and the homepage project needs redeploying.** There is no way to
make the wildcard rule cover new pages automatically - this was tested and does not work for cross-
project destinations.

Don't bother with a project-local `vercel.json` INSIDE the zone itself as a workaround (mapping
the basePath-prefixed path to an un-prefixed one) - that was tried first and did not fix the proxy
case at all, even though it appeared to still work on direct-domain access afterward. The fix has
to live in the proxying project's (`site/`) own `vercel.json`, as literal rules.

**Verifying every page in every zone resolves through the homepage**, after any change here:

```bash
for p in "/obsidian/" "/obsidian/ap/" "/obsidian/sanctum/" "/obsidian/threshold/" \
         "/obsidian/cg_example/" "/obsidian/cg_example/ap/" "/obsidian/cg_example/sanctum/" "/obsidian/cg_example/threshold/" \
         "/sticky-cards/" "/sticky-cards/ap/" \
         "/sticky-cards/cg_example/" "/sticky-cards/cg_example/ap/"; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' "https://ap-codegrid.vercel.app${p}?cb=$RANDOM")"
done
```

Every line should print `200`. (The `?cb=$RANDOM` is just a cache-buster for manual testing - it's
not required for the rewrites themselves to work.) **Remember this only tests server-side
resolution - it says nothing about Gotcha 0 above, which only shows up on an actual click in a
real browser.**

A smaller, related trap bundled into the same fix: a wildcard rule's destination template also
mishandles the case where `:match*` matches **zero** segments - i.e. the bare `/obsidian/`
trailing-slash request with nothing after it - even in isolation from the page-route problem
above. The literal rule for the exact zone-root path (with and without trailing slash) sidesteps
this too, which is why the root-level rules were already in place before the page-route problem
above was fully understood.

### Gotcha 2: Vercel's automatic basePath routing for a statically-exported Next.js app on DIRECT domain access is inconsistent across Next.js major versions

This is a different, narrower problem than Gotcha 1 above - it's about a zone's own domain in
isolation, with no proxying involved at all.

On Next 16, hitting a project's own domain at its basePath (e.g. `/obsidian/`) correctly resolves
to the page and its `_next` assets, even though those files physically live at the output root
(`out/index.html`, `out/_next/...`), not nested under a `sticky-cards/`-style folder. On Next 15,
that same automatic resolution does not reliably happen - the page and its `_next` assets 404 even
hitting the project's own domain directly. Rather than depend on that undocumented,
version-dependent platform behavior, the `sticky-cards/mine` and `sticky-cards/cg_example` zones
(both on Next 15) run a small post-build script (`scripts/mirror-basepath.mjs`, wired into `npm
run build`) that physically copies the exported output into a basePath-matching subfolder, so
every basePath-prefixed path the HTML actually references exists as a real file on disk regardless
of what Vercel's framework detection does with it. If a future zone ends up on Next 15 (or this
breaks again on some other Next version), copy that script and add `&& node
scripts/mirror-basepath.mjs` to its `build` script rather than re-debugging this from scratch.
**Do not apply this script to a Next 16 zone** - on Next 16 the files it would mirror typically
already exist, so it's a redundant no-op there, not a fix for anything (confirmed while
investigating Gotcha 1 above - this script does nothing to help the cross-project proxy problem,
which needed the literal-rule fix instead).

### Keeping Next.js patched

Vercel's deploy pipeline actively blocks deployment of known-vulnerable Next.js versions on
Hobby/Pro plans - one of the sticky-cards zones got hard-blocked this way when its Next.js version
fell behind. Check `npm audit` after bumping; the minimum version that clears a given CVE batch
per Next's own advisories isn't always the same as the minimum version `npm audit` is satisfied
with, since npm's advisory database tracks separate, sometimes more recent, CVEs.
