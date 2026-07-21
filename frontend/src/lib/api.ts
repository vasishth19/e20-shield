/**
 * Thin fetch wrapper for the E20-Shield backend API (Section 9).
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (see .env.example).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export type MatchType = "verified" | "estimated";

export interface VehicleLookupResponse {
  match_type: MatchType;
  make: string;
  model: string;
  mfg_year: number;
  emission_standard: string;
  fuel_delivery_system: string | null;
  fuel_tank_material: string | null;
  max_safe_ethanol_pct: number;
  confidence: string;
  source_reference: string | null;
  disclaimer: string;
}

export interface RiskPredictionResponse {
  component_health_score: number;
  estimated_months_to_service_need: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  top_contributing_factors: string[];
  disclaimer: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export function lookupVehicle(make: string, model: string, year: number) {
  const params = new URLSearchParams({ make, model, year: String(year) });
  return apiFetch<VehicleLookupResponse>(`/vehicles/lookup?${params.toString()}`);
}

export function submitUnlistedVehicle(payload: {
  make: string;
  model: string;
  mfg_year: number;
  claimed_emission_standard?: string;
  claimed_fuel_delivery_system?: string;
}) {
  return apiFetch(`/vehicles/submit-unlisted`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function predictRisk(payload: {
  vehicle_age_years: number;
  native_ethanol_tolerance_pct: number;
  fuel_delivery_system: "Carburettor" | "Fuel_Injection";
  self_reported_monthly_km: number;
  region_state?: string;
}) {
  return apiFetch<RiskPredictionResponse>(`/predict/risk-score`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTransparencyMetrics() {
  return apiFetch<{ official_metrics: unknown[]; user_reported_metrics: unknown[] }>(
    `/policy/transparency-metrics`
  );
}

export function getClusters(state?: string) {
  const qs = state ? `?state=${encodeURIComponent(state)}` : "";
  return apiFetch<unknown[]>(`/spatial/clusters${qs}`);
}

export interface VehicleSearchEntry {
  make: string;
  model: string;
  years_available: number[];
}

export function searchVehicles(make?: string, model?: string) {
  const params = new URLSearchParams();
  if (make) params.set("make", make);
  if (model) params.set("model", model);
  const qs = params.toString();
  return apiFetch<VehicleSearchEntry[]>(`/vehicles/search${qs ? `?${qs}` : ""}`);
}
