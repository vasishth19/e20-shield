"use client";

/**
 * Admin panel (Section 5, module 7): moderate crowdsourced vehicle
 * submissions. Requires a Supabase-issued admin JWT — see
 * backend/services/auth.py::require_admin.
 */

import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/vehicles/submissions/${submissionId}/approve`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        setStatusOk(false);
        setStatus(`Error ${res.status}: ${await res.text()}`);
        return;
      }
      setStatusOk(true);
      setStatus("Approved and promoted to verified reference data.");
    } catch (err) {
      setStatusOk(false);
      setStatus(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-danger" />
          <span className="text-xs text-zinc-400">Restricted — admin role required</span>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Admin Panel</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Approve pending vehicle submissions from the open queue, promoting
          them into the verified reference table.
        </p>

        <div className="glass-panel p-6 space-y-4">
          <input
            className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent2/60 transition-colors"
            placeholder="Admin bearer token (Supabase JWT)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <input
            className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent2/60 transition-colors"
            placeholder="Submission ID"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
          />
          <button
            onClick={handleApprove}
            disabled={loading || !token || !submissionId}
            className="w-full bg-accent hover:bg-indigo-500 shadow-glow transition-all py-2 rounded-md font-medium disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? "Approving..." : "Approve submission"}
          </button>
          {status && (
            <p className={`text-sm ${statusOk ? "text-safe" : "text-danger"}`}>{status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
