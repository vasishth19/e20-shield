"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupVehicle, submitUnlistedVehicle, VehicleLookupResponse } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ScanLine, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

const SCAN_STAGES = [
  "Initializing AI engine...",
  "Looking up verified reference data...",
  "Cross-checking emission standard...",
  "Estimating fuel-system compatibility...",
  "Finalizing report...",
];

export default function CheckerPage() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState<VehicleLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmitted(false);
    setStageIndex(0);

    stageTimer.current = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, SCAN_STAGES.length - 1));
    }, 450);

    try {
      const data = await lookupVehicle(make.trim(), model.trim(), Number(year));
      // Ensure the scan animation plays for at least a moment even on fast responses.
      await new Promise((r) => setTimeout(r, 900));
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Couldn't reach the backend: ${err.message}. If you're testing a fresh deploy, confirm NEXT_PUBLIC_API_BASE_URL and CORS_ALLOWED_ORIGINS are set correctly.`
          : "Something went wrong. Please try again."
      );
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current);
      setLoading(false);
    }
  }

  async function handleSubmitUnlisted() {
    try {
      await submitUnlistedVehicle({ make: make.trim(), model: model.trim(), mfg_year: Number(year) });
      setSubmitted(true);
    } catch {
      setSubmitted(false);
    }
  }

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span className="text-xs text-zinc-400">Live lookup — never refuses an input</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Compatibility Checker</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Type any make, model, and manufacturing year — any vehicle, not just
          those already in our database. We&apos;ll always give you an answer.
        </p>

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent2/60"
              placeholder="Make (e.g. Hyundai)"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
            <input
              className="bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent2/60"
              placeholder="Model (e.g. Creta)"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            <input
              className="bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent2/60"
              placeholder="Year (e.g. 2022)"
              type="number"
              min={1980}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-indigo-500 shadow-glow transition-all py-2 rounded-md font-medium disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            {loading ? "Scanning..." : "Check compatibility"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 glass-panel p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} className="text-accent2 animate-pulse" />
                <span className="text-sm font-medium">AI Inspection in progress</span>
              </div>
              <div className="space-y-2">
                {SCAN_STAGES.map((stage, i) => (
                  <div
                    key={stage}
                    className={`text-sm flex items-center gap-2 transition-colors ${
                      i < stageIndex ? "text-safe" : i === stageIndex ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    {i < stageIndex ? (
                      <CheckCircle2 size={14} className="text-safe" />
                    ) : i === stageIndex ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                    )}
                    {stage}
                  </div>
                ))}
              </div>
              <div className="w-full h-1 bg-border rounded-full mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-accent2"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((stageIndex + 1) / SCAN_STAGES.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 glass-panel p-4 border-danger/40 text-danger text-sm flex items-start gap-2"
          >
            <XCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass-panel p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  result.match_type === "verified"
                    ? "bg-safe/20 text-safe"
                    : "bg-warn/20 text-warn"
                }`}
              >
                {result.match_type === "verified" ? "VERIFIED" : "ESTIMATED"}
              </span>
              <span className="text-sm text-zinc-400">
                Confidence: {result.confidence}
              </span>
            </div>

            <h2 className="text-lg font-medium mb-1">
              {result.make} {result.model} ({result.mfg_year})
            </h2>

            <dl className="grid grid-cols-2 gap-y-2 text-sm mt-4">
              <dt className="text-zinc-400">Emission standard</dt>
              <dd>{result.emission_standard}</dd>
              <dt className="text-zinc-400">Max safe ethanol %</dt>
              <dd className="font-medium">E{result.max_safe_ethanol_pct}</dd>
              {result.fuel_delivery_system && (
                <>
                  <dt className="text-zinc-400">Fuel delivery</dt>
                  <dd>{result.fuel_delivery_system}</dd>
                </>
              )}
            </dl>

            <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
              {result.source_reference ?? result.disclaimer}
            </p>

            {result.match_type === "estimated" && !submitted && (
              <button
                onClick={handleSubmitUnlisted}
                className="mt-4 text-sm text-accent hover:underline"
              >
                This is my exact vehicle — help improve accuracy by submitting it
              </button>
            )}
            {submitted && (
              <p className="mt-4 text-sm text-safe">
                Thanks — submitted for admin review.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
