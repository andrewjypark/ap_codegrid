// Next.js only recognizes a layout by this exact filename
// ("layout.js") inside a route segment -- it can't be renamed. This
// file just delegates to the real implementation in
// src/app/layout_ap.js, so that file stays the one you actually edit.
//
// Only pages placed inside this ap route group use this layout; every
// other route keeps using only the tutorial's root src/app/layout.js.
export { default } from "../layout_ap";
