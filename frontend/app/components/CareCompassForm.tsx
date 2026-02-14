"use client";

import { useState } from "react";
import type { ProjectionParams, AnalyzeResponse } from "../lib/api";

interface Props {
  setResults: (data: AnalyzeResponse | null) => void;
  onComplete: () => void;
}

export default function CareCompassForm({ setResults, onComplete }: Props) {
  const [age, setAge] = useState(55);
  const [zipCode, setZipCode] = useState("");
  const [menopausalStatus, setMenopausalStatus] = useState<"pre" | "post" | "unknown">("unknown");
  const [stage, setStage] = useState<"I" | "II" | "III" | "IV" | "unknown">("unknown");
  const [erPositive, setErPositive] = useState<boolean | null>(null);
  const [prPositive, setPrPositive] = useState<boolean | null>(null);
  const [her2Positive, setHer2Positive] = useState<boolean | null>(null);
  const [fertilityConcern, setFertilityConcern] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const handleSubmit = async () => {
    setError(null);
    if (!zipCode.trim()) {
      setError("ZIP code is required.");
      return;
    }
    setLoading(true);
    setElapsed(0);
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    try {
      const { runProjection } = await import("../lib/api");
      const params: ProjectionParams = {
        age,
        zip_code: zipCode.trim(),
        menopausal_status: menopausalStatus,
        stage_at_diagnosis: stage,
        er_positive: erPositive === null ? undefined : erPositive,
        pr_positive: prPositive === null ? undefined : prPositive,
        her2_positive: her2Positive === null ? undefined : her2Positive,
        fertility_preservation_concern: fertilityConcern,
      };
      const data = await runProjection(params);
      setResults(data);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setResults(null);
    } finally {
      clearInterval(timer);
      setLoading(false);
      setElapsed(0);
    }
  };

  return (
    <div className="space-y-4 max-w-xl bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-1">Patient intake</h2>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Age at diagnosis *</label>
          <input type="number" min={18} max={100} value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="input" />
        </div>
        <div>
          <label className="label">ZIP code *</label>
          <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 10001" maxLength={10} className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Stage at diagnosis</label>
          <select value={stage} onChange={(e) => setStage(e.target.value as typeof stage)} className="input">
            <option value="unknown">Unknown</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
        <div>
          <label className="label">Menopausal status</label>
          <select value={menopausalStatus} onChange={(e) => setMenopausalStatus(e.target.value as typeof menopausalStatus)} className="input">
            <option value="unknown">Unknown</option>
            <option value="pre">Pre</option>
            <option value="post">Post</option>
          </select>
        </div>
      </div>

      <div>
        <span className="label">Receptor status (if known)</span>
        <div className="flex flex-wrap gap-4 mt-1">
          {([["ER", erPositive, setErPositive], ["PR", prPositive, setPrPositive], ["HER2", her2Positive, setHer2Positive]] as const).map(
            ([lbl, val, setVal]) => (
              <label key={lbl} className="flex items-center gap-2">
                <span className="text-sm font-medium">{lbl}</span>
                <select value={val === null ? "" : val ? "yes" : "no"}
                  onChange={(e) => (setVal as (v: boolean | null) => void)(e.target.value === "" ? null : e.target.value === "yes")}
                  className="border border-stone-300 rounded p-1 text-sm">
                  <option value="">Unknown</option>
                  <option value="yes">Positive</option>
                  <option value="no">Negative</option>
                </select>
              </label>
            )
          )}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={fertilityConcern} onChange={(e) => setFertilityConcern(e.target.checked)} />
        <span className="text-sm">Fertility preservation concern</span>
      </label>

      {loading && (
        <p className="text-sm text-stone-600 font-medium">
          Running Monte Carlo simulation… {elapsed}s
        </p>
      )}

      <button type="button" onClick={handleSubmit} disabled={loading}
        className="bg-stone-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-stone-700 disabled:opacity-60 transition">
        {loading ? "Running simulation…" : "Run analysis"}
      </button>
    </div>
  );
}
