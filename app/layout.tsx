// src/app/layout.tsx

import type { Metadata } from "next";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import Link from "next/link";
import StoreProvider from "@/components/StoreProvider";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

export const metadata: Metadata = {
  title: "CryptoTrack — Live Crypto Dashboard",
  description: "Real-time cryptocurrency prices, market caps, and trends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable} ${dm.variable}`}>
      <body className="bg-app-bg text-app-text-muted antialiased">

        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-app-nav border-b border-app-border-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-app-accent flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="stroke-app-accent-on">
                    <path d="M2 10 L5 6 L8 8 L12 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-app-syne font-extrabold text-sm text-app-text tracking-wide">
                  Crypto<span className="text-app-accent">Track</span>
                </span>
              </Link>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-1">
                {[
                  { href: "/dashboard", label: "Dashboard", active: true },
                  { href: "#", label: "Portfolio" },
                  { href: "#", label: "Watchlist" },
                  { href: "#", label: "News" },
                ].map((link) => (
                  <Link key={link.label} href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-app-syne font-semibold transition-colors ${
                      link.active
                        ? "bg-app-accent-muted border border-app-accent-muted-border text-app-accent"
                        : "text-app-text-dim hover:text-app-text"
                    }`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-app-positive animate-pulse inline-block" />
                <span className="text-xs font-app-mono text-app-text-dim">LIVE</span>
              </div>
              {/* Notification bell */}
              <button className="w-8 h-8 bg-app-bg-button-ghost border border-app-border-strong rounded-lg flex items-center justify-center hover:border-app-border-hover transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-app-text-muted" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-app-accent to-app-positive flex items-center justify-center text-xs font-app-syne font-bold text-app-text-inverse">
                K
              </div>
            </div>
          </div>
        </nav>

        {/* Page content (ticker tape removed; dashboard table/cards show live data) */}
        <main>
          <StoreProvider>{children}</StoreProvider>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-app-border-subtle mt-16 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs font-app-mono text-app-text-footer">
              © 2024 CryptoTrack · Data by CoinGecko · Educational use only
            </p>
            <p className="text-xs font-app-mono text-app-text-footer">
              Next.js · TypeScript · Redux Toolkit · Tailwind CSS
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}