"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { searchVehicles, VehicleSearchEntry } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Search, Car, Database, ArrowUpDown } from "lucide-react";

type SortKey = "make" | "model" | "years";

export default function DatabasePage() {
  const [entries, setEntries] = useState<VehicleSearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("make");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    searchVehicles()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = entries;
    if (q) {
      rows = rows.filter(
        (e) => e.make.toLowerCase().includes(q) || e.model.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "make") cmp = a.make.localeCompare(b.make);
      else if (sortKey === "model") cmp = a.model.localeCompare(b.model);
      else cmp = (a.years_available.length) - (b.years_available.length);
      return sortAsc ? cmp : -cmp;
    });
  }, [entries, query, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span className="text-xs text-zinc-400">Live — pulled directly from the reference database</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="text-accent2" size={22} />
          <h1 className="text-2xl font-semibold">Live Vehicle Database</h1>
        </div>
        <p className="text-zinc-400 text-sm mb-8 max-w-xl">
          Every make/model currently seeded as Verified reference data —
          searchable, sortable, and growing as users submit new vehicles.
        </p>

        <div className="glass-panel p-4 mb-6 flex items-center gap-3">
          <Search size={16} className="text-zinc-500" />
          <input
            className="bg-transparent flex-1 text-sm focus:outline-none"
            placeholder="Search by make or model (e.g. Hyundai, Creta)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-xs text-zinc-500">{filtered.length} results</span>
        </div>

        {loading && <p className="text-zinc-500 text-sm">Loading live data...</p>}

        {!loading && (
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-400 border-b border-border">
                  <th className="p-3">
                    <button onClick={() => toggleSort("make")} className="flex items-center gap-1 hover:text-white">
                      Make <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="p-3">
                    <button onClick={() => toggleSort("model")} className="flex items-center gap-1 hover:text-white">
                      Model <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="p-3">
                    <button onClick={() => toggleSort("years")} className="flex items-center gap-1 hover:text-white">
                      Year bands covered <ArrowUpDown size={12} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={`${entry.make}-${entry.model}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3) }}
                    className="border-b border-border/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 flex items-center gap-2">
                      <Car size={14} className="text-zinc-500" /> {entry.make}
                    </td>
                    <td className="p-3">{entry.model}</td>
                    <td className="p-3 text-zinc-400">{entry.years_available.join(", ")}</td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-zinc-500">
                      No vehicles match &quot;{query}&quot; — try the Checker page,
                      any vehicle still gets an estimated answer even if it's not listed here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
