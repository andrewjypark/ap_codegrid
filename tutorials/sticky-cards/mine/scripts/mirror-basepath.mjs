// Vercel's automatic basePath routing for statically-exported Next.js apps is
// inconsistent across Next.js major versions (confirmed: works on Next 16,
// does not reliably resolve page routes / _next assets through a basePath
// prefix on Next 15 static exports). Rather than depend on that undocumented
// platform behavior, this script physically mirrors the exported output so
// every basePath-prefixed path the HTML actually references
// (e.g. /sticky-cards/_next/..., /sticky-cards/ap) exists as a real file on
// disk. This runs as part of `npm run build` so it applies to every
// deployment, including future git-triggered builds on Vercel.
//
// Implementation note: basePath can be more than one segment deep
// (e.g. "/sticky-cards/cg_example"), in which case the destination directory
// is itself nested inside a top-level output folder (out/sticky-cards/...).
// Copying out/* directly into that destination would mean copying a
// directory into its own descendant. To avoid that, snapshot the current
// output into a temp directory first, then copy the snapshot into the
// basePath-nested destination.
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import nextConfig from '../next.config.mjs';

const basePath = nextConfig.basePath;
if (!basePath) {
  console.log('[mirror-basepath] no basePath set, skipping');
  process.exit(0);
}

const outDir = join(process.cwd(), 'out');
const destRoot = join(outDir, ...basePath.split('/').filter(Boolean));

if (!existsSync(outDir)) {
  console.error('[mirror-basepath] out/ directory not found — run `next build` first');
  process.exit(1);
}

const snapshotDir = mkdtempSync(join(tmpdir(), 'mirror-basepath-'));
try {
  cpSync(outDir, snapshotDir, { recursive: true, force: true });
  cpSync(snapshotDir, destRoot, { recursive: true, force: true });
  console.log(`[mirror-basepath] mirrored out/* into out${basePath}/`);
} finally {
  rmSync(snapshotDir, { recursive: true, force: true });
}
