"use client";

import { useState } from "react";
import type { ProjectionParams } from "../lib/api";

interface CareCompassFormProps {
  setResults: (data: unknown) => void;
}

export default function CareCompassForm({ setResults }: CareCompassFormProps) {
  const [age, setAge] = useState(55);
  const [zipCode, setZipCode] = useState("");
  const [menopausalStatus, setMenopausalStatus] = useState<"pre" | "post" | "unknown">("unknown");
  const [stage, setStage] = useState<"I" | "II" | "III" | "IV" | "unknown">("unknown");
  const [erPositive, setErPositive] = useState<boolean | null>(null);
  const [prPositive, setPrPositive] = useState<boolean | null>(null);
  const [her2Positive, setHer2Positive] = useState<boolean | null>(null);
  const [fertilityConcern, setFertilityConcern] = useState(false);
  const [treatmentAdherence, setTreatmentAdherence] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!zipCode.trim()) {
      setError("ZIP code is required.");
      return;
    }
    setLoading(true);
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
        treatment_adherence: treatmentAdherence / 100,
      };
      const data = await runProjection(params);
      setResults(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Projection failed";
      setError(message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Age at diagnosis *</label>
        <input
          type="number"
          min={18}
          max={100}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP code *</label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="e.g. 94102"
          className="border border-gray-300 rounded p-2 w-full"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Menopausal status (if known)</label>
        <select
          value={menopausalStatus}
          onChange={(e) => setMenopausalStatus(e.target.value as "pre" | "post" | "unknown")}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="unknown">Unknown</option>
          <option value="pre">Pre</option>
          <option value="post">Post</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stage at diagnosis (if known)</label>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as "I" | "II" | "III" | "IV" | "unknown")}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="unknown">Unknown / not yet staged</option>
          <option value="I">I</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-1">Receptor subtype (if known)</span>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">ER</span>
            <select
              value={erPositive === null ? "" : erPositive ? "yes" : "no"}
              onChange={(e) => setErPositive(e.target.value === "" ? null : e.target.value === "yes")}
              className="border border-gray-300 rounded p-1"
            >
              <option value="">Unknown</option>
              <option value="yes">Positive</option>
              <option value="no">Negative</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm">PR</span>
            <select
              value={prPositive === null ? "" : prPositive ? "yes" : "no"}
              onChange={(e) => setPrPositive(e.target.value === "" ? null : e.target.value === "yes")}
              className="border border-gray-300 rounded p-1"
            >
              <option value="">Unknown</option>
              <option value="yes">Positive</option>
              <option value="no">Negative</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm">HER2</span>
            <select
              value={her2Positive === null ? "" : her2Positive ? "yes" : "no"}
              onChange={(e) => setHer2Positive(e.target.value === "" ? null : e.target.value === "yes")}
              className="border border-gray-300 rounded p-1"
            >
              <option value="">Unknown</option>
              <option value="yes">Positive</option>
              <option value="no">Negative</option>
            </select>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fertilityConcern}
            onChange={(e) => setFertilityConcern(e.target.checked)}
          />
          <span className="text-sm">Fertility preservation concern</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Treatment adherence (70–100%)
        </label>
        <input
          type="range"
          min={70}
          max={100}
          value={treatmentAdherence}
          onChange={(e) => setTreatmentAdherence(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-600">{treatmentAdherence}%</span>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Running projection…" : "Run outcome projection"}
      </button>
    </div>
  );
}
