import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E20-Shield | Fuel Compatibility Intelligence Platform",
  description:
    "Check your vehicle's E20 fuel compatibility, understand component wear risk, and see regional trends — all clearly labeled as Verified, Estimated, User-reported, or Model prediction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <nav className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-base/70 px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-semibold text-lg tracking-tight flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent2 shadow-glow-cyan" />
            E20<span className="text-shimmer">-Shield</span>
          </a>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="/checker" className="hover:text-white transition-colors">Checker</a>
            <a href="/predict" className="hover:text-white transition-colors">Risk Predictor</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="/database" className="hover:text-white transition-colors">Database</a>
            <a href="/policy" className="hover:text-white transition-colors">Policy</a>
            <a href="/visualize-3d" className="hover:text-white transition-colors">3D View</a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
