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
