"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { getClusters } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";

interface RegionStat {
  region_state: string;
  region_district: string | null;
  total_reports: number;
  pct_fuel_line_leak: number;
  pct_starting_trouble: number;
}

function LiveStatCard({
  label, value, suffix = "", accent = "text-accent2", live = false,
}: { label: string; value: number; suffix?: string; accent?: string; live?: boolean }) {
  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      {live && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Live</span>
        </div>
      )}
      <div className={`text-3xl font-semibold stat-number ${accent}`}>
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-zinc-400 mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated real-time engagement counters — clearly separate from the
  // real, backend-sourced fault-report aggregates below. Never presented
  // as verified data; purely a "platform activity" pulse for visual energy.
  const [simSearches, setSimSearches] = useState(18420);
  const [simSubmissions, setSimSubmissions] = useState(342);
  const [trend, setTrend] = useState<{ t: number; v: number }[]>(
    Array.from({ length: 24 }, (_, i) => ({ t: i, v: 40 + Math.random() * 30 }))
  );

  useEffect(() => {
    getClusters()
      .then((res) => setData(res as RegionStat[]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSimSearches((v) => v + Math.floor(Math.random() * 4));
      if (Math.random() > 0.7) setSimSubmissions((v) => v + 1);
      setTrend((prev) => {
        const next = [...prev.slice(1), { t: prev[prev.length - 1].t + 1, v: 40 + Math.random() * 30 }];
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalRegionReports = data.reduce((a, r) => a + r.total_reports, 0);
  const avgLeak = data.length
    ? (data.reduce((a, r) => a + r.pct_fuel_line_leak, 0) / data.length).toFixed(1)
    : "0.0";

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span className="text-xs text-zinc-400">Live platform pulse</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Regional & Platform Dashboard</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Fault-report stats below are real, aggregated backend data
          (min. 5 reports/region privacy threshold). The activity counters
          are a simulated platform-pulse visual, clearly separate from
          verified figures.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <LiveStatCard label="Vehicle searches (simulated)" value={simSearches} live accent="text-accent2" />
          <LiveStatCard label="Vehicles submitted (simulated)" value={simSubmissions} live accent="text-safe" />
          <LiveStatCard label="Regions with reports (real)" value={data.length} accent="text-accent" />
          <LiveStatCard label="Total aggregated reports (real)" value={totalRegionReports} accent="text-warn" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 glass-panel p-6" style={{ height: 280 }}>
            <div className="text-sm text-zinc-400 mb-2">Simulated platform activity (last 24 intervals)</div>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#26262E" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0F0F13", border: "1px solid #26262E" }} />
                <Area type="monotone" dataKey="v" stroke="#818CF8" fill="url(#trendFill)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel p-6 flex flex-col items-center justify-center" style={{ height: 280 }}>
            <div className="text-sm text-zinc-400 mb-2 self-start">Avg. fuel-line-leak rate (real)</div>
            <ResponsiveContainer width="100%" height="85%">
              <RadialBarChart
                innerRadius="70%" outerRadius="100%"
                data={[{ name: "leak", value: Number(avgLeak), fill: "#FB923C" }]}
                startAngle={90} endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-2xl font-semibold -mt-16">{avgLeak}%</div>
          </div>
        </div>

        {loading && <p className="text-zinc-500 text-sm">Loading real aggregation data...</p>}

        {!loading && data.length === 0 && (
          <div className="glass-panel p-6 text-sm text-zinc-400">
            No regions currently meet the minimum-report privacy threshold yet.
            As more people submit reports via the crowdsourced reporting flow,
            regional patterns will appear here — this is real backend data,
            not simulated.
          </div>
        )}

        {!loading && data.length > 0 && (
          <>
            <div className="glass-panel p-6 mb-6" style={{ height: 320 }}>
              <div className="text-sm text-zinc-400 mb-2">Reports by region (real)</div>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data}>
                  <CartesianGrid stroke="#26262E" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="region_state" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0F0F13", border: "1px solid #26262E" }} />
                  <Bar dataKey="pct_fuel_line_leak" fill="#FB923C" name="% fuel line leak" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pct_starting_trouble" fill="#818CF8" name="% starting trouble" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table className="w-full text-sm glass-panel">
              <thead>
                <tr className="text-left text-zinc-400 border-b border-border">
                  <th className="p-3">State</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Reports</th>
                  <th className="p-3">% Leak</th>
                  <th className="p-3">% Starting trouble</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-3">{row.region_state}</td>
                    <td className="p-3">{row.region_district ?? "—"}</td>
                    <td className="p-3">{row.total_reports}</td>
                    <td className="p-3">{row.pct_fuel_line_leak}%</td>
                    <td className="p-3">{row.pct_starting_trouble}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
