import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import "./globals.css";

import NavBar from "@/components/Navbar";
import TransitionProvider from "@/providers/TransitionProvider";

// Load the two Google fonts and expose each as a CSS variable (the
// `variable` option) instead of a plain class name. That makes both fonts
// available globally via var(--font-instrument-serif) / var(--font-instrument-sans)
// in CSS, instead of being scoped to one element.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Block Reveal Page Transition | Codegrid",
  description: "Block Reveal Page Transition | Codegrid",
};

// RootLayout is the Next.js App Router's root layout — every route in the
// app gets rendered through this component.
//
// `children` is NOT something this file creates; Next.js passes it in
// automatically. It represents whichever page component matches the
// current URL (e.g. the default export of app/page.js, app/about/page.js,
// etc.). Whatever route the user is on, Next.js swaps in the matching
// page as `children`, while everything else defined in this layout (the
// <html>/<body> shell, fonts, NavBar) stays mounted across every page.
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable}`}
    >
      <body>
        {/*
          TransitionProvider (src/providers/TransitionProvider.jsx) also
          accepts a `children` prop. Here we're forwarding NavBar and the
          current page's content down into it as ITS children, so they end
          up rendered inside the page-transition machinery:

            Next.js picks the matching page for the current route
              -> handed to RootLayout as `children`
                -> RootLayout renders <NavBar /> and {children} together,
                   both as children of TransitionProvider
                  -> TransitionProvider renders its own transition-grid /
                     heading markup, then renders those children among it
                    -> TransitionRouter (next-transition-router) watches
                       for route changes and runs the GSAP enter/leave
                       animations, swapping the page content in and out
                       underneath the animated block overlay.

          So "children" isn't being created twice — it's the same idea
          (the current page's content) being passed down one level at a
          time: Next.js -> RootLayout -> TransitionProvider -> TransitionRouter.
          NavBar, on the other hand, is always the same component on every
          page — it's just riding along as a sibling of {children} here.
        */}
        <TransitionProvider>
          <NavBar />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
