import "./globals.css";

export const metadata = {
  title: "OH Architecture Sticky Cards | Codegrid",
  description: "OH Architecture Sticky Cards | Codegrid",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
