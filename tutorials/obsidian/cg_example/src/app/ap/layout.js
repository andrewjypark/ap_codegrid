// Next.js only recognizes a layout by this exact filename
// ("layout.js") inside a route segment -- it can't be renamed. This
// file just delegates to the real implementation in
// src/app/layout_ap.js, so that file stays the one you actually edit.
//
// Only pages placed inside this (ap) route group use this layout; the
// group's parentheses don't appear in the URL (e.g. a page at
// src/app/(ap)/showcase/page.js is served at /showcase). Every other
// route keeps using only the tutorial's root src/app/layout.js.
export { default } from "../layout_ap";

import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import "./globals.css";

import NavBar from "@/components/Navbar";
import TransitionProvider from "@/providers/TransitionProvider";

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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable}`}
    >
      <body>
        <TransitionProvider>
          <NavBar />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
