#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

echo "Cleaning dist"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

build_zone() {
  zone_path="$1"
  dist_sub="$2"
  zone_dir="$ROOT_DIR/$zone_path"

  echo "Building $zone_path"
  cd "$zone_dir"
  npm install
  npm run build
  cd "$ROOT_DIR"

  out_dir="$zone_dir/out"
  dest_dir="$DIST_DIR/$dist_sub"
  echo "Copying $out_dir to $dest_dir"
  mkdir -p "$dest_dir"
  rsync -a "$out_dir"/ "$dest_dir"/
}

build_zone tutorials/obsidian/mine obsidian
build_zone tutorials/obsidian/cg_example obsidian/cg_example
build_zone tutorials/sticky-cards/mine sticky-cards
build_zone tutorials/sticky-cards/cg_example sticky-cards/cg_example

echo "Writing site index and nojekyll"
cp "$ROOT_DIR/site/index.html" "$DIST_DIR/index.html"
touch "$DIST_DIR/.nojekyll"

echo "dist ready"
find "$DIST_DIR" -maxdepth 2
