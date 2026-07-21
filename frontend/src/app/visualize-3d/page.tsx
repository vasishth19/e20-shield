"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

// React Three Fiber cannot be server-prerendered — load client-side only.
const RealisticCar3D = dynamic(() => import("@/components/RealisticCar3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[28rem] rounded-2xl bg-black/20 flex items-center justify-center text-zinc-500 text-sm">
      Loading 3D view...
    </div>
  ),
});

const EngineModel3D = dynamic(() => import("@/components/EngineModel3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg bg-black/20 flex items-center justify-center text-zinc-500 text-sm">
      Loading degradation view...
    </div>
  ),
});

const PAINT_OPTIONS = [
  { label: "Signature Blue", value: "#3b82f6" },
  { label: "Racing Red", value: "#ef4444" },
  { label: "Graphite", value: "#3f3f46" },
  { label: "Pearl White", value: "#e4e4e7" },
  { label: "Emerald", value: "#10b981" },
];

export default function Visualize3DPage() {
  const [years, setYears] = useState(5);
  const [paint, setPaint] = useState(PAINT_OPTIONS[0].value);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span className="text-xs text-zinc-400">Live 3D — real-time render, not a video</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Interactive 3D Vehicle View</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Drag to rotate, scroll to zoom. Fully procedural — a stylized
          showroom model rather than a licensed vehicle asset.
        </p>

        <div className="glass-panel p-4 mb-4">
          <RealisticCar3D paintColor={paint} autoRotate={autoRotate} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-14">
          <span className="text-sm text-zinc-400 mr-2">Paint:</span>
          {PAINT_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPaint(p.value)}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                paint === p.value ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: p.value }}
              title={p.label}
            />
          ))}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className="ml-auto text-sm border border-border rounded-md px-3 py-1.5 text-zinc-300 hover:border-accent2/50"
          >
            {autoRotate ? "Pause rotation" : "Resume rotation"}
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">Ethanol Exposure — Educational View</h2>
        <p className="text-zinc-400 text-sm mb-8">
          Illustrative, not to scale. Rubber fuel lines degrade faster than
          metal fuel tanks under sustained ethanol exposure, per ARAI&apos;s
          published findings.
        </p>

        <div className="glass-panel p-4">
          <EngineModel3D exposureYears={years} />
        </div>

        <label className="block text-sm mt-6">
          Simulated exposure: {years} years
          <input
            type="range"
            min={0}
            max={20}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full mt-1 accent-accent"
          />
        </label>
      </div>
    </div>
  );
}
