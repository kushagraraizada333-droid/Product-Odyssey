import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRODUCT ODYSSEY: JUMP. THINK. BUILD. BECOME A PM.",
  description: "Collect coins. Crack product challenges. Reach the castle. Get hired. The complete 2D platform-adventure PM interview game.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen overflow-x-hidden antialiased select-none">
        {children}
      </body>
    </html>
  );
}
