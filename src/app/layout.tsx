import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "gear-inventory",
  description: "Photography equipment inventory with camera capture and Claude research.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-5">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              gear<span className="text-accent">-inventory</span>
            </Link>
            <p className="text-sm text-muted">Photography equipment tracker</p>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
