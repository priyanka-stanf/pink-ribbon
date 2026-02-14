"use client";

import React, { useEffect, useState } from "react";
import type { ProjectionResult as ProjectionResultType, PathwayResult, EvidenceItem } from "../lib/api";

interface ProjectionResultsProps {
  data: ProjectionResultType;
}

const PATHWAY_LABELS: Record<string, string> = {
  lumpectomy_radiation: "Lumpectomy + radiation",
  mastectomy_no_recon: "Mastectomy without reconstruction",
  mastectomy_recon: "Mastectomy with reconstruction",
  chemotherapy_plus_surgery: "Chemotherapy + surgery",
  endocrine_therapy: "Endocrine therapy",
  her2_targeted: "HER2 targeted therapy",
  clinical_trial: "Clinical trial",
};

export default function ProjectionResults({ data }: ProjectionResultsProps) {
  const nIter = data.monte_carlo_n_iterations ?? 0;
  const timeSec = data.monte_carlo_computation_seconds ?? 0;
  const seed = data.random_seed_used;

  return (
    <div className="mt-10 space-y-8 max-w-5xl">
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        This tool provides probabilistic projections based on public registry and clinical trial data. It does not replace clinical guidance.
      </p>
      <p className="text-sm text-gray-600">
        A Monte Carlo simulation with <strong>{nIter.toLocaleString()}</strong> iterations was run in <strong>{timeSec}</strong> seconds
        {seed != null && <> (random seed: {seed})</>}. 0–5 year horizon; no life expectancy estimated.
      </p>
      <p className="text-sm text-gray-700">
        Results derived from Monte Carlo simulation using registry and clinical trial data. Parameters are traceable to SEER, CMS, and PubMed sources.
      </p>

      {data.narrative_summary && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Summary</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.narrative_summary}</p>
        </section>
      )}

      <PathwayComparisonTable pathways={data.pathways} />
      <TradeoffBubbleChart pathways={data.pathways} />
      <PathwayChartsWithUncertainty pathways={data.pathways} />
      {data.pathways.some((p) => p.average_symptom_intensity_by_month?.length) && (
        <SymptomCurveChart pathways={data.pathways} />
      )}
      {data.pathways[0]?.uncertainty_drivers && (
        <UncertaintyDriversChart drivers={data.pathways[0].uncertainty_drivers} />
      )}
      <EvidencePanels pathways={data.pathways} />
      <HowThisModelWorksModal />
      {data.stage_sampled && data.subtype_sampled && (
        <p className="text-xs text-gray-500">
          How regional treatment utilization influences outcome variability: ZIP code maps to state; CMS regional utilization differences are used where available. Stage and subtype shown are those used in this run ({data.stage_sampled}, {data.subtype_sampled}).
        </p>
      )}
      {data.data_provenance && (
        <p className="text-xs text-gray-500 border-t pt-4">{data.data_provenance}</p>
      )}
    </div>
  );
}

function PathwayComparisonTable({ pathways }: { pathways: PathwayResult[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Treatment pathway comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Pathway</th>
              <th className="border border-gray-300 p-2 text-right">P(recurrence 5y)</th>
              <th className="border border-gray-300 p-2 text-right">95% SI</th>
              <th className="border border-gray-300 p-2 text-right">Cost (median, IQR)</th>
              <th className="border border-gray-300 p-2 text-right">Symptom months</th>
              <th className="border border-gray-300 p-2 text-right">QALM (5y)</th>
              <th className="border border-gray-300 p-2 text-right">P(major LTE)</th>
            </tr>
          </thead>
          <tbody>
            {pathways.map((p) => (
              <tr key={p.pathway} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 font-medium">
                  <span>{PATHWAY_LABELS[p.pathway] ?? p.pathway}</span>
                  {p.higher_uncertainty_label && (
                    <span className="block text-xs text-amber-700 mt-0.5">{p.higher_uncertainty_label}</span>
                  )}
                  {p.fertility_adjusted_quality_impact && (
                    <span className="block text-xs text-blue-700 mt-0.5">Fertility-adjusted quality impact applied.</span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {(p.probability_recurrence_5y * 100).toFixed(1)}%
                </td>
                <td className="border border-gray-300 p-2 text-right text-gray-600">
                  [{(p.probability_recurrence_5y_95_si_low * 100).toFixed(1)}%, {(p.probability_recurrence_5y_95_si_high * 100).toFixed(1)}%]
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ${(p.cost_distribution.median / 1000).toFixed(0)}k (IQR ${(p.cost_distribution.iqr / 1000).toFixed(0)}k)
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {p.expected_symptom_months_moderate_severe.toFixed(1)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {p.mean_quality_adjusted_months_5y.toFixed(1)}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {(p.probability_major_long_term_side_effect * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TradeoffBubbleChart({ pathways }: { pathways: PathwayResult[] }) {
  const [Chart, setChart] = useState<React.ComponentType<{ data: BubbleDatum[] }> | null>(null);
  useEffect(() => {
    import("recharts").then((recharts) => {
      const { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Legend } = recharts;
      setChart(() => function C({ data: chartData }: { data: BubbleDatum[] }) {
        return (
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ left: 20, right: 20 }}>
              <XAxis type="number" dataKey="recurrencePct" name="P(recurrence 5y)" unit="%" />
              <YAxis type="number" dataKey="symptomMonths" name="Symptom months" />
              <ZAxis type="number" dataKey="costK" range={[100, 2000]} name="Cost (median, $k)" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload as BubbleDatum;
                  return (
                    <div className="bg-white border rounded shadow-lg p-2 text-sm">
                      <div className="font-medium">{d.pathwayLabel}</div>
                      <div>P(recurrence 5y): {d.recurrencePct.toFixed(1)}%</div>
                      <div>Symptom months: {d.symptomMonths.toFixed(1)}</div>
                      <div>Median cost: ${d.costK.toFixed(0)}k</div>
                      <div>P(major LTE): {(d.toxicityPct * 100).toFixed(1)}%</div>
                    </div>
                  );
                }}
              />
              <Scatter data={chartData} fill="#3b82f6" name="Pathway" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      });
    });
  }, []);

  type BubbleDatum = {
    pathwayLabel: string;
    pathway: string;
    recurrencePct: number;
    symptomMonths: number;
    costK: number;
    toxicityPct: number;
  };
  const bubbleData: BubbleDatum[] = pathways.map((p) => ({
    pathwayLabel: PATHWAY_LABELS[p.pathway] ?? p.pathway,
    pathway: p.pathway,
    recurrencePct: p.probability_recurrence_5y * 100,
    symptomMonths: p.expected_symptom_months_moderate_severe,
    costK: p.cost_distribution.median / 1000,
    toxicityPct: p.probability_major_long_term_side_effect,
  }));

  if (!Chart) return <div className="h-80 animate-pulse bg-gray-100 rounded" />;
  return (
    <section>
      <h3 className="text-sm font-medium text-gray-600 mb-2">
        Treatment tradeoffs: recurrence vs symptom burden (bubble size = cost, color = long-term toxicity risk)
      </h3>
      <Chart data={bubbleData} />
    </section>
  );
}

type ChartDatum = { pathwayLabel: string; recurrencePct: number; siLow: number; siHigh: number };

function PathwayChartsWithUncertainty({ pathways }: { pathways: PathwayResult[] }) {
  const [Chart, setChart] = useState<React.ComponentType<{ data: ChartDatum[] }> | null>(null);
  useEffect(() => {
    import("recharts").then((recharts) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
      setChart(() => (props: { data: ChartDatum[] }) => (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={props.data} layout="vertical" margin={{ left: 140 }}>
            <XAxis type="number" domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="pathwayLabel" width={130} tick={{ fontSize: 10 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as ChartDatum;
                return (
                  <div className="bg-white border rounded shadow-lg p-2 text-sm">
                    <div className="font-medium">{d.pathwayLabel}</div>
                    <div>P(recurrence 5y): {d.recurrencePct.toFixed(1)}%</div>
                    <div className="text-gray-600">95% SI: [{d.siLow.toFixed(1)}%, {d.siHigh.toFixed(1)}%]</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="recurrencePct" name="P(recurrence 5y)" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      ));
    });
  }, []);

  const barData: ChartDatum[] = pathways.map((p) => ({
    pathwayLabel: PATHWAY_LABELS[p.pathway] ?? p.pathway,
    recurrencePct: Math.round(p.probability_recurrence_5y * 1000) / 10,
    siLow: Math.round(p.probability_recurrence_5y_95_si_low * 1000) / 10,
    siHigh: Math.round(p.probability_recurrence_5y_95_si_high * 1000) / 10,
  }));

  if (!Chart) return <div className="h-80 animate-pulse bg-gray-100 rounded" />;
  return (
    <section>
      <h3 className="text-sm font-medium text-gray-600 mb-2">P(recurrence within 5 years) by pathway</h3>
      <Chart data={barData} />
    </section>
  );
}

function SymptomCurveChart({ pathways }: { pathways: PathwayResult[] }) {
  const [Chart, setChart] = useState<React.ComponentType<{ chartData: Record<string, number>[] }> | null>(null);
  useEffect(() => {
    import("recharts").then((recharts) => {
      const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } = recharts;
      setChart(() => function C({ chartData }: { chartData: Record<string, number>[] }) {
        const keys = chartData.length ? Object.keys(chartData[0]).filter((k) => k !== "month") : [];
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              {keys.map((k) => (
                <Line key={k} type="monotone" dataKey={k} name={PATHWAY_LABELS[k] ?? k} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      });
    });
  }, []);

  const series = pathways.filter(
    (p) => p.average_symptom_intensity_by_month && p.average_symptom_intensity_by_month!.length === 60
  );
  const chartData = Array.from({ length: 60 }, (_, m) => {
    const row: Record<string, number> = { month: m };
    series.forEach((p) => {
      row[p.pathway] = p.average_symptom_intensity_by_month![m];
    });
    return row;
  });

  if (!Chart || series.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-medium text-gray-600 mb-2">Average symptom intensity over 5 years by pathway</h3>
      <Chart chartData={chartData} />
    </section>
  );
}

function UncertaintyDriversChart({ drivers }: { drivers: Record<string, number> }) {
  const [Chart, setChart] = useState<React.ComponentType<{ data: { name: string; value: number }[] }> | null>(null);
  useEffect(() => {
    import("recharts").then((recharts) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = recharts;
      setChart(() => (props: { data: { name: string; value: number }[] }) => (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={props.data} layout="vertical" margin={{ left: 180 }}>
            <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
            <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
            <Bar dataKey="value" fill="#6366f1" name="Variance %" />
          </BarChart>
        </ResponsiveContainer>
      ));
    });
  }, []);

  const labels: Record<string, string> = {
    baseline_stage_distribution: "Baseline stage distribution",
    treatment_effect_uncertainty: "Treatment effect uncertainty",
    toxicity_probability_uncertainty: "Toxicity probability uncertainty",
    cost_distribution_variability: "Cost distribution variability",
    regional_utilization_variability: "Regional utilization variability",
  };
  const data = Object.entries(drivers).map(([k, v]) => ({ name: labels[k] ?? k, value: v })).filter((d) => d.value > 0);

  if (!Chart || data.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-medium text-gray-600 mb-2">What drives uncertainty in this projection?</h3>
      <Chart data={data} />
    </section>
  );
}

function EvidencePanels({ pathways }: { pathways: PathwayResult[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Evidence & data sources</h2>
      <p className="text-sm text-gray-600 mb-4">
        Which sources influenced recurrence risk, toxicity modeling, cost modeling, and quality-of-life utilities for each pathway.
      </p>
      {pathways.map((p) => (
        <EvidencePanel key={p.pathway} pathway={p.pathway} evidence={p.evidence} />
      ))}
    </section>
  );
}

function EvidencePanel({ pathway, evidence }: { pathway: string; evidence?: Record<string, EvidenceItem[]> }) {
  const [open, setOpen] = useState(false);
  if (!evidence) return null;
  const categories = Object.entries(evidence);
  return (
    <div className="border border-gray-200 rounded mb-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-medium">{PATHWAY_LABELS[pathway] ?? pathway}</span>
        <span>{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="p-4 text-sm space-y-4">
          {categories.map(([cat, items]) => (
            <div key={cat}>
              <h4 className="font-medium text-gray-700 capitalize">{cat.replace(/_/g, " ")}</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {items.map((e, i) => (
                  <li key={i}>
                    {e.data_source}
                    {e.study_type && ` (${e.study_type})`}
                    {e.pubmed_id && ` PMID: ${e.pubmed_id}`}
                    {e.year && ` ${e.year}`}
                    {e.notes_transformation && ` — ${e.notes_transformation}`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HowThisModelWorksModal() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-blue-600 hover:underline"
      >
        How this model works
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg p-6 text-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">How this model works</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Monte Carlo simulation with N iterations (e.g. 5,000) per pathway.</li>
              <li>Stage and subtype are sampled from SEER age-conditional distributions when not provided.</li>
              <li>Baseline 5-year recurrence probability is sampled from SEER stage-specific distributions.</li>
              <li>Treatment hazard ratios (from RCTs/meta-analyses) are applied to baseline recurrence; clinical trial uses a wider effect distribution.</li>
              <li>Recurrence within 5 years is modeled as Bernoulli trial with the adjusted probability.</li>
              <li>Acute and persistent toxicity probabilities are sampled from literature-based rates; symptom intensity is time-distributed (acute decay, endocrine persistent).</li>
              <li>Cost per pathway is sampled from CMS-based distributions (lognormal), not fixed constants.</li>
              <li>Quality-adjusted months (QALM) use literature-derived utility weights applied monthly; fertility concern adds a penalty for infertility-related pathways when the flag is set.</li>
              <li>Adherence (70–100%) scales effective treatment benefit probabilistically.</li>
            </ul>
            <button type="button" onClick={() => setOpen(false)} className="mt-4 px-3 py-1 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
