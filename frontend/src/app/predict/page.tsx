"use client";

import { useState } from "react";
import { predictRisk, RiskPredictionResponse } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function PredictPage() {
  const [age, setAge] = useState(5);
  const [tolerance, setTolerance] = useState(10);
  const [delivery, setDelivery] = useState<"Carburettor" | "Fuel_Injection">("Fuel_Injection");
  const [monthlyKm, setMonthlyKm] = useState(1000);
  const [result, setResult] = useState<RiskPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await predictRisk({
        vehicle_age_years: age,
        native_ethanol_tolerance_pct: tolerance,
        fuel_delivery_system: delivery,
        self_reported_monthly_km: monthlyKm,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <AnimatedBackground />
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-2 mb-2">
        <span className="live-dot" />
        <span className="text-xs text-zinc-400">Live model — GradientBoosting + SHAP</span>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Component Wear Risk Predictor</h1>
      <p className="text-zinc-400 text-sm mb-8">
        A model estimate, not a diagnosis — always shown with a confidence
        interval and its top contributing factors.
      </p>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
        <label className="block text-sm">
          Vehicle age (years): {age}
          <input type="range" min={0} max={25} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full" />
        </label>
        <label className="block text-sm">
          Native ethanol tolerance
          <select
            className="w-full bg-base border border-border rounded-md px-3 py-2 mt-1"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
          >
            <option value={5}>E5</option>
            <option value={10}>E10</option>
            <option value={20}>E20</option>
          </select>
        </label>
        <label className="block text-sm">
          Fuel delivery
          <select
            className="w-full bg-base border border-border rounded-md px-3 py-2 mt-1"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value as "Carburettor" | "Fuel_Injection")}
          >
            <option value="Fuel_Injection">Fuel Injection</option>
            <option value="Carburettor">Carburettor</option>
          </select>
        </label>
        <label className="block text-sm">
          Monthly usage (km): {monthlyKm}
          <input type="range" min={0} max={5000} step={100} value={monthlyKm} onChange={(e) => setMonthlyKm(Number(e.target.value))} className="w-full" />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-indigo-500 transition-colors py-2 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Predict risk"}
        </button>
      </form>

      {result && (
        <div className="mt-6 glass-panel p-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-semibold">{result.component_health_score}</span>
            <span className="text-zinc-400 text-sm">/100 health score</span>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Confidence interval: {result.confidence_interval_low} – {result.confidence_interval_high}
          </p>
          <p className="text-sm mb-2">
            Estimated months to next service need:{" "}
            <span className="font-medium">{result.estimated_months_to_service_need}</span>
          </p>
          <ul className="text-sm text-zinc-400 list-disc pl-5 mb-4">
            {result.top_contributing_factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500">{result.disclaimer}</p>
        </div>
      )}
    </div>
    </div>
  );
}
