"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProfile } from "../../context/ProfileContext";
import type { HospitalSimulationResult } from "../../lib/api";

const PATHWAY_LABELS: Record<string, string> = {
  lumpectomy_radiation: "Lumpectomy + radiation",
  mastectomy_no_recon: "Mastectomy without reconstruction",
  mastectomy_recon: "Mastectomy with reconstruction",
  endocrine_only: "Endocrine therapy only",
  chemo_plus_surgery: "Chemotherapy + surgery",
  her2_targeted: "HER2-targeted therapy",
  clinical_trial: "Clinical trial",
};

export default function HospitalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { loadResults } = useProfile();

  const [sim, setSim] = useState<HospitalSimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const results = loadResults();
    const found = results?.find((r) => r.hospital.id === id);
    if (found) {
      setSim(found);
    } else {
      setError("No pre-computed data for this hospital. Run the analysis from intake first.");
    }
  }, [id, loadResults]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/intake" className="text-blue-600 underline">
          Go to intake
        </Link>
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
        <p className="text-stone-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/results"
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← Back to comparison
        </Link>

        <h1 className="text-2xl font-bold mb-1">{sim.hospital.name}</h1>
        <p className="text-sm text-stone-500 mb-6">
          {sim.hospital.type} · {sim.hospital.distance_miles} mi ·
          Stage/subtype: {sim.stage_used}/{sim.subtype_used} ·{" "}
          {sim.N_iterations.toLocaleString()} iterations · seed{" "}
          {sim.random_seed} · {sim.runtime_seconds}s
        </p>

        <Disclaimer />

        {/* ── Recurrence ── */}
        <Section title="5-year recurrence risk">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {(sim.recurrence_5y_mean * 100).toFixed(1)}%
            </span>
            <span className="text-stone-600 text-sm">
              95% CI: {(sim.recurrence_5y_ci_low * 100).toFixed(1)}–
              {(sim.recurrence_5y_ci_high * 100).toFixed(1)}%
            </span>
          </div>
        </Section>

        {/* ── QALM ── */}
        <Section title="Quality-adjusted life months (5y)">
          {sim.qalm_dist ? (
            <DistBar dist={sim.qalm_dist} unit="months" />
          ) : (
            <p>Mean: {sim.qalm_mean.toFixed(1)} months</p>
          )}
        </Section>

        {/* ── Cost ── */}
        <Section title="Estimated cost (5y)">
          {sim.cost_dist ? (
            <DistBar dist={sim.cost_dist} format="currency" />
          ) : (
            <p>Median: ${(sim.cost_median / 1000).toFixed(0)}k</p>
          )}
          <p className="text-xs text-stone-500 mt-1">
            IQR: ${(sim.cost_iqr[0] / 1000).toFixed(0)}k – $
            {(sim.cost_iqr[1] / 1000).toFixed(0)}k
          </p>
        </Section>

        {/* ── Symptoms ── */}
        <Section title="Symptom burden">
          <p className="text-stone-700">
            Average moderate/severe symptom months (5y):{" "}
            <strong>{sim.symptom_months_mean.toFixed(1)}</strong>
          </p>
          <p className="text-stone-700">
            Probability of major long-term side effect:{" "}
            <strong>{(sim.major_lte_prob * 100).toFixed(1)}%</strong>
          </p>
        </Section>

        {/* ── Treatment mix ── */}
        <Section title="Inferred treatment mix">
          <p className="text-sm text-stone-600 mb-3">
            Estimated distribution of treatment pathways at this hospital type
            (proxy, not actual tumor board decisions).
          </p>
          <ul className="space-y-1.5">
            {Object.entries(sim.treatment_mix)
              .sort((a, b) => b[1] - a[1])
              .map(([pathway, weight]) => (
                <li key={pathway} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 rounded bg-stone-600"
                    style={{ width: `${Math.max(4, weight * 200)}px` }}
                  />
                  <span>
                    {PATHWAY_LABELS[pathway] || pathway}:{" "}
                    {(weight * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
          </ul>
        </Section>

        <Disclaimer />
      </div>
    </div>
  );
}

// ── Shared components ────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Disclaimer() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 mb-8">
      <strong>Disclaimer.</strong> Treatment patterns are inferred proxies based
      on hospital type and public data — not exact tumor board decisions.
      Projections are probabilistic. 0–5 year horizon only. This tool does not
      replace clinical guidance.
    </div>
  );
}

function DistBar({
  dist,
  unit,
  format,
}: {
  dist: { mean: number; std: number; p5: number; p95: number };
  unit?: string;
  format?: "currency";
}) {
  const lo = dist.p5;
  const hi = dist.p95;
  const range = hi - lo || 1;
  const left = ((dist.mean - dist.std - lo) / range) * 100;
  const width = ((2 * dist.std) / range) * 100;
  const display =
    format === "currency"
      ? `$${(dist.mean / 1000).toFixed(1)}k`
      : dist.mean.toFixed(1);

  return (
    <div>
      <p className="text-stone-700 mb-2">
        Mean: <strong>{display}</strong>{" "}
        {unit && <span className="text-stone-500">({unit})</span>}
      </p>
      <div className="h-8 bg-stone-200 rounded relative overflow-hidden">
        <div
          className="absolute h-full bg-stone-600 rounded"
          style={{
            left: `${Math.max(0, left)}%`,
            width: `${Math.min(100, width)}%`,
          }}
        />
      </div>
      <p className="text-xs text-stone-500 mt-1">
        5th–95th percentile:{" "}
        {format === "currency"
          ? `$${(lo / 1000).toFixed(0)}k – $${(hi / 1000).toFixed(0)}k`
          : `${lo.toFixed(1)} – ${hi.toFixed(1)} ${unit || ""}`}
      </p>
    </div>
  );
}
