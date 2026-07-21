"use client";

import { useEffect, useState } from "react";
import { getTransparencyMetrics } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";

interface Metric {
  label: string;
  value: string | number | null;
  source: string;
  as_of?: string;
}

export default function PolicyPage() {
  const [official, setOfficial] = useState<Metric[]>([]);
  const [userReported, setUserReported] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransparencyMetrics()
      .then((res) => {
        setOfficial((res.official_metrics as Metric[]) || []);
        setUserReported((res.user_reported_metrics as Metric[]) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  function MetricCard({ m, accent }: { m: Metric; accent: string }) {
    return (
      <div className={`glass-panel p-5 hover:${accent} transition-shadow`}>
        <div className="text-2xl font-semibold stat-number">{m.value ?? "—"}</div>
        <div className="text-sm text-zinc-300 mt-1">{m.label}</div>
        <div className="text-xs text-zinc-500 mt-3 pt-3 border-t border-border/60">
          Source: {m.source}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span className="text-xs text-zinc-400">Live — pulled from real aggregation queries</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Policy Transparency</h1>
        <p className="text-zinc-400 text-sm mb-10 max-w-xl">
          Official figures are kept clearly separate from aggregated,
          self-reported user data — never blended into a single misleading number.
        </p>

        {loading && <p className="text-zinc-500 text-sm mb-8">Loading live metrics...</p>}

        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-safe" />
          <h2 className="text-xs uppercase tracking-widest text-safe font-medium">Official / cited data</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {official.map((m, i) => <MetricCard key={i} m={m} accent="shadow-glow-green" />)}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-warn" />
          <h2 className="text-xs uppercase tracking-widest text-warn font-medium">
            Aggregated user-reported data (unverified)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userReported.map((m, i) => <MetricCard key={i} m={m} accent="shadow-glow" />)}
        </div>
      </div>
    </div>
  );
}
