"use client";

import React, { useEffect, useState } from "react";
import type { AnalyzeResponse, PathwayResult } from "../lib/api";

const PATHWAY_LABELS: Record<string, string> = {
  lumpectomy_radiation: "Lumpectomy + radiation",
  mastectomy_no_recon: "Mastectomy without reconstruction",
  mastectomy_recon: "Mastectomy with reconstruction",
  chemotherapy_plus_surgery: "Chemotherapy + surgery",
  endocrine_therapy: "Endocrine therapy",
  her2_targeted: "HER2-targeted therapy",
  clinical_trial: "Clinical trial",
};

export default function SimulationResults({ data }: { data: AnalyzeResponse }) {
  const mc = data.monte_carlo;
  const rec = data.recommended_plan;
  const eligible = data.pathways.filter((p) => p.eligible);
  const ineligible = data.pathways.filter((p) => !p.eligible);

  return (
    <div className="space-y-8">
      {/* ── MC proof metadata ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 space-y-1">
        <div>
          <strong>Monte Carlo simulation</strong> ran{" "}
          <strong>{mc.n_iterations.toLocaleString()}</strong> iterations per pathway
          in <strong>{mc.runtime_seconds}s</strong> (seed: <code className="bg-amber-100 px-1 rounded">{mc.random_seed}</code>).
        </div>
        <div>
          Stage: {data.patient_summary.stage_used}, Subtype: {data.patient_summary.subtype_used}.
          0–5 year horizon; no life expectancy.
        </div>
        <div className="text-xs text-amber-700">
          Ranking based on clinical outcomes only (recurrence + quality of life + toxicity).
          Cost is shown for reference but does not affect plan ranking.
          All intervals are empirical quantiles (2.5th/97.5th percentile).
        </div>
      </div>

      {/* ── Recommended plan ── */}
      {rec.pathway_key && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-900 mb-1">
            Recommended plan: {PATHWAY_LABELS[rec.pathway_key] || rec.pathway_key}
          </h3>
          <p className="text-sm text-emerald-800">{rec.explanation}</p>
          <p className="text-xs text-emerald-700 mt-2 italic">{rec.disclaimer}</p>
        </div>
      )}

      {/* ── Bar chart ── */}
      <RecurrenceChart pathways={eligible} bestKey={rec.pathway_key} />

      {/* ── Comparison table ── */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Eligible pathway comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200">
                <th className="text-left p-3 font-medium">Pathway</th>
                <th className="text-right p-3 font-medium">P(recurrence 5y)</th>
                <th className="text-right p-3 font-medium">95% SI</th>
                <th className="text-right p-3 font-medium text-stone-400">Cost (ref. only)</th>
                <th className="text-right p-3 font-medium">Symptom months</th>
                <th className="text-right p-3 font-medium">QALM (5y)</th>
                <th className="text-right p-3 font-medium">P(major LTE)</th>
                <th className="text-right p-3 font-medium">Utility</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((p) => {
                const isBest = p.pathway === rec.pathway_key;
                return (
                  <tr key={p.pathway}
                    className={`border-b border-stone-100 ${isBest ? "bg-emerald-50 font-medium" : "hover:bg-stone-50"}`}>
                    <td className="p-3">
                      {isBest && <span className="text-emerald-600 mr-1">★</span>}
                      {PATHWAY_LABELS[p.pathway] ?? p.pathway}
                      {p.higher_uncertainty_label && (
                        <span className="ml-1 text-xs text-amber-600" title={p.higher_uncertainty_label}>⚠</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {((p.probability_recurrence_5y ?? 0) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-stone-500">
                      [{((p.probability_recurrence_5y_95_si_low ?? 0) * 100).toFixed(1)}–
                      {((p.probability_recurrence_5y_95_si_high ?? 0) * 100).toFixed(1)}%]
                    </td>
                    <td className="p-3 text-right text-stone-400">
                      ${((p.cost_distribution?.median ?? 0) / 1000).toFixed(0)}k
                      <span className="text-xs ml-1">
                        (IQR ${((p.cost_distribution?.iqr ?? 0) / 1000).toFixed(0)}k)
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {(p.expected_symptom_months_moderate_severe ?? 0).toFixed(1)}
                      {p.symptom_months_95_si && (
                        <span className="text-stone-400 text-xs block">
                          [{p.symptom_months_95_si[0].toFixed(0)}–{p.symptom_months_95_si[1].toFixed(0)}]
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {(p.mean_quality_adjusted_months_5y ?? 0).toFixed(1)}
                      {p.qalm_95_si && (
                        <span className="text-stone-400 text-xs block">
                          [{p.qalm_95_si[0].toFixed(1)}–{p.qalm_95_si[1].toFixed(1)}]
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {((p.probability_major_long_term_side_effect ?? 0) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-right font-mono">
                      {(p.utility_score ?? 0).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ineligible pathways ── */}
      {ineligible.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-stone-500 mb-2">Ineligible pathways</h3>
          <ul className="text-sm text-stone-500 space-y-1">
            {ineligible.map((p) => (
              <li key={p.pathway}>
                <span className="font-medium">{PATHWAY_LABELS[p.pathway] ?? p.pathway}</span>
                {" — "}{p.ineligible_reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── MC proof per pathway ── */}
      <MCProofSection pathways={eligible} />

      {/* ── Provenance ── */}
      <section className="border-t border-stone-200 pt-4">
        <h3 className="text-sm font-semibold text-stone-500 mb-2">Data provenance</h3>
        <p className="text-xs text-stone-500">
          SEER: {data.provenance.seer_version} · CMS: {data.provenance.cms_dataset} ·
          PubMed PMIDs: {data.provenance.pmids_used.join(", ")} ·
          Horizon: {data.provenance.horizon}
        </p>
        <p className="text-xs text-stone-400 mt-1">{data.provenance.disclaimer}</p>
      </section>
    </div>
  );
}

// ── MC proof details (collapsible per pathway) ──────────────────────────

function MCProofSection({ pathways }: { pathways: PathwayResult[] }) {
  const [open, setOpen] = React.useState(false);
  const proofs = pathways.filter((p) => p.mc_proof);
  if (!proofs.length) return null;
  return (
    <section className="border-t border-stone-200 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-stone-500 hover:text-stone-700 flex items-center gap-1"
      >
        <span className={`transition ${open ? "rotate-90" : ""}`}>▸</span>
        Monte Carlo proof details ({proofs.length} pathways)
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {proofs.map((p) => {
            const pr = p.mc_proof!;
            const ss = pr.sample_sizes;
            const ck = pr.convergence_checkpoints;
            return (
              <div key={p.pathway} className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600 space-y-1">
                <div className="font-medium text-stone-800">
                  {PATHWAY_LABELS[p.pathway] ?? p.pathway}
                </div>
                <div>
                  N = {pr.N.toLocaleString()} iterations · runtime = {pr.runtime_seconds}s ·
                  interval method: {pr.interval_method}
                </div>
                <div>
                  Recurrence events: {ss.recurrence_events}/{ss.total_iterations} ·
                  Toxicity events: {ss.toxicity_events}/{ss.total_iterations}
                </div>
                <div>
                  Convergence (running mean): {ck.map((c) =>
                    `k=${c.k}: ${(c.recurrence_running_mean * 100).toFixed(2)}%`
                  ).join(" → ")}
                </div>
                <div className="text-stone-400">
                  {pr.parameter_uncertainty}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Recurrence bar chart (recharts, lazy) ────────────────────────────────

type ChartDatum = { label: string; pct: number; siLow: number; siHigh: number; isBest: boolean };

function RecurrenceChart({ pathways, bestKey }: { pathways: PathwayResult[]; bestKey: string | null }) {
  const [Chart, setChart] = useState<React.ComponentType<{ data: ChartDatum[] }> | null>(null);

  useEffect(() => {
    import("recharts").then((rc) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = rc;
      setChart(() => function C({ data: d }: { data: ChartDatum[] }) {
        return (
          <ResponsiveContainer width="100%" height={Math.max(260, d.length * 48)}>
            <BarChart data={d} layout="vertical" margin={{ left: 160, right: 20 }}>
              <XAxis type="number" domain={[0, "auto"]} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="label" width={155} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const item = payload[0].payload as ChartDatum;
                  return (
                    <div className="bg-white border rounded shadow-lg p-2 text-sm">
                      <div className="font-medium">{item.label}</div>
                      <div>Recurrence: {item.pct.toFixed(1)}%</div>
                      <div className="text-stone-500">95% SI: [{item.siLow.toFixed(1)}–{item.siHigh.toFixed(1)}%]</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="pct" name="P(recurrence 5y)">
                {d.map((entry, i) => (
                  <Cell key={i} fill={entry.isBest ? "#059669" : "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      });
    });
  }, []);

  const barData: ChartDatum[] = pathways.map((p) => ({
    label: PATHWAY_LABELS[p.pathway] ?? p.pathway,
    pct: (p.probability_recurrence_5y ?? 0) * 100,
    siLow: (p.probability_recurrence_5y_95_si_low ?? 0) * 100,
    siHigh: (p.probability_recurrence_5y_95_si_high ?? 0) * 100,
    isBest: p.pathway === bestKey,
  }));

  if (!Chart) return <div className="h-64 animate-pulse bg-stone-100 rounded-lg" />;

  return (
    <section>
      <h3 className="text-sm font-medium text-stone-600 mb-2">
        P(recurrence within 5 years) by pathway — <span className="text-emerald-600">★ best plan highlighted</span>
      </h3>
      <Chart data={barData} />
    </section>
  );
}
