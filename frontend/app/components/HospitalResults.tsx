"use client";

import type { AnalyzeResponse, HospitalResult } from "../lib/api";

const PATHWAY_LABELS: Record<string, string> = {
  lumpectomy_radiation: "Lumpectomy + radiation",
  mastectomy_no_recon: "Mastectomy without reconstruction",
  mastectomy_recon: "Mastectomy with reconstruction",
  chemotherapy_plus_surgery: "Chemotherapy + surgery",
  endocrine_therapy: "Endocrine therapy",
  her2_targeted: "HER2-targeted therapy",
  clinical_trial: "Clinical trial",
};

const COST_TIER_COLORS: Record<string, string> = {
  green: "text-emerald-600",
  yellow: "text-amber-600",
  red: "text-red-600",
};

const COST_TIER_BG: Record<string, string> = {
  green: "bg-emerald-50 border-emerald-200",
  yellow: "bg-amber-50 border-amber-200",
  red: "bg-red-50 border-red-200",
};

function StarRating({ stars }: { stars: number | null }) {
  if (stars == null) return <span className="text-stone-400 text-xs">N/A</span>;
  return (
    <span title={`CMS Overall Hospital Quality: ${stars}/5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < stars ? "text-amber-500" : "text-stone-300"}>★</span>
      ))}
    </span>
  );
}

function CmsRatingBadge({ label, value }: { label: string; value: string }) {
  let color = "text-stone-600 bg-stone-100";
  if (value === "Above average" || value === "Below national average") {
    color = "text-emerald-700 bg-emerald-50";
  } else if (value === "Below average" || value === "Above national average") {
    color = "text-red-700 bg-red-50";
  }
  // For spending: "Below national average" is good (green), "Above national average" is bad (red)
  if (label === "Spending") {
    if (value === "Below national average") color = "text-emerald-700 bg-emerald-50";
    else if (value === "Above national average") color = "text-red-700 bg-red-50";
    else color = "text-stone-600 bg-stone-100";
  }
  return (
    <div className="text-xs">
      <span className="text-stone-500">{label}: </span>
      <span className={`px-1.5 py-0.5 rounded ${color}`}>{value}</span>
    </div>
  );
}

export default function HospitalResults({ data }: { data: AnalyzeResponse }) {
  const hospitals = data.hospitals_top5;
  const planKey = data.recommended_plan.pathway_key;
  const planLabel = planKey ? (PATHWAY_LABELS[planKey] || planKey) : "recommended plan";

  if (data.hospital_message) {
    return (
      <div className="bg-stone-100 rounded-lg p-6 text-stone-600">
        <p>{data.hospital_message}</p>
      </div>
    );
  }

  if (!hospitals.length) {
    return (
      <div className="bg-stone-100 rounded-lg p-6 text-stone-600">
        <p>No hospitals found near ZIP {data.patient_summary.zip_code}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-stone-100 rounded-lg p-4 text-sm text-stone-700">
        <p>
          Top {hospitals.length} hospital(s) near ZIP <strong>{data.patient_summary.zip_code}</strong> most
          likely to provide <strong>{planLabel}</strong>, ranked by a composite of capability match,
          CMS quality rating, and distance.
        </p>
      </div>

      <div className="grid gap-4">
        {hospitals.map((h, i) => (
          <HospitalCard key={h.id} hospital={h} rank={i + 1} />
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-500">
        <h4 className="font-semibold text-stone-700 text-sm">Understanding the indicators</h4>
        <p>
          <strong>Overall quality</strong> (★★★★★): CMS Hospital Compare overall star rating (1–5).
          Combines mortality, safety, readmission, patient experience, and timely care measures.
          Source: <em>data.cms.gov/provider-data</em>.
        </p>
        <p>
          <strong>Cost-effectiveness</strong>: Derived from CMS "Medicare Spending per Beneficiary" measure.
          <span className="text-emerald-600 font-bold"> $</span> = Below national average (lower cost),
          <span className="text-amber-600 font-bold"> $$</span> = Same as national average,
          <span className="text-red-600 font-bold"> $$$</span> = Above national average (higher cost).
        </p>
        <p>
          <strong>Mortality / Readmission / Patient Experience</strong>: CMS Hospital Compare group measures.
          "Above average" for mortality means higher-than-expected mortality (worse);
          "Below average" for readmission means fewer-than-expected readmissions (better).
        </p>
        <p className="text-stone-400 italic">
          Hospital capability to provide a specific treatment pathway is inferred from CMS data
          (hospital type, oncology services, procedure volume). This is an approximation, not
          confirmed availability.
        </p>
      </div>
    </div>
  );
}

function HospitalCard({ hospital: h, rank }: { hospital: HospitalResult; rank: number }) {
  const tierColor = COST_TIER_COLORS[h.cost_tier] || "text-stone-600";
  const tierBg = COST_TIER_BG[h.cost_tier] || "bg-stone-50 border-stone-200";

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header: rank, name, type */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-stone-400 bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center">
              {rank}
            </span>
            <h3 className="font-semibold text-stone-900">{h.name}</h3>
          </div>

          {/* Key metrics row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 mb-3">
            <span className="capitalize bg-stone-100 px-2 py-0.5 rounded text-xs">{h.type}</span>
            <span>{h.distance_miles} mi</span>
            <StarRating stars={h.cms_overall_stars} />
            <span className={`font-bold text-lg ${tierColor} border rounded px-2 py-0.5 ${tierBg}`}
              title={h.cost_tier_label}>
              {h.cost_tier_symbol}
            </span>
          </div>

          {/* CMS detail badges */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <CmsRatingBadge label="Mortality" value={h.cms_mortality_rating} />
            <CmsRatingBadge label="Readmission" value={h.cms_readmission_rating} />
            <CmsRatingBadge label="Patient experience" value={h.cms_patient_experience} />
            <CmsRatingBadge label="Spending" value={h.cms_spending_per_beneficiary} />
          </div>
        </div>

        {/* Capability score */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-stone-500">Capability</div>
          <div className="text-2xl font-bold text-stone-800">
            {(h.capability_score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-stone-400 mt-1">
            Score: {h.composite_score.toFixed(3)}
          </div>
        </div>
      </div>
    </div>
  );
}
