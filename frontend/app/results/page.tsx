"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProfile } from "../context/ProfileContext";
import type { HospitalSimulationResult } from "../lib/api";

export default function ResultsPage() {
  const router = useRouter();
  const { results, loadResults, loadProfile } = useProfile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    const r = loadResults();
    if (!p || !r?.length) {
      router.replace("/intake");
      return;
    }
    setReady(true);
  }, [loadProfile, loadResults, router]);

  if (!ready || !results?.length) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
        <p className="text-stone-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Hospital comparison</h1>
        <p className="text-sm text-stone-600 mb-6">
          Nearby hospitals and 5-year outcome projections. Click a hospital name
          for detailed distributions and treatment mix.
        </p>

        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200">
                <th className="text-left p-3 font-medium">Hospital</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Distance</th>
                <th className="text-right p-3 font-medium">5y recurrence</th>
                <th className="text-right p-3 font-medium">QALM (mean)</th>
                <th className="text-right p-3 font-medium">Cost (median)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: HospitalSimulationResult) => (
                <tr
                  key={r.hospital.id}
                  className="border-b border-stone-100 hover:bg-stone-50"
                >
                  <td className="p-3">
                    <Link
                      href={`/hospitals/${r.hospital.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {r.hospital.name}
                    </Link>
                  </td>
                  <td className="p-3 capitalize">{r.hospital.type}</td>
                  <td className="p-3 text-right">
                    {r.hospital.distance_miles} mi
                  </td>
                  <td className="p-3 text-right">
                    {(r.recurrence_5y_ci_low * 100).toFixed(1)}–
                    {(r.recurrence_5y_ci_high * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-right">{r.qalm_mean.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    ${(r.cost_median / 1000).toFixed(0)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MC metadata */}
        <div className="mt-4 text-xs text-stone-500 space-y-0.5">
          {results.map((r) => (
            <p key={r.hospital.id}>
              {r.hospital.name}: {r.N_iterations.toLocaleString()} iterations,{" "}
              {r.runtime_seconds.toFixed(2)}s, seed {r.random_seed}
            </p>
          ))}
        </div>

        <p className="mt-6 text-xs text-stone-500 max-w-2xl">
          Projections are probabilistic and based on public registry and
          hospital-level treatment patterns. They do not represent individual
          prognosis or tumor board decisions. 0–5 year horizon only.
        </p>

        <Link
          href="/intake"
          className="inline-block mt-4 text-blue-600 hover:underline text-sm"
        >
          ← New analysis
        </Link>
      </div>
    </div>
  );
}
