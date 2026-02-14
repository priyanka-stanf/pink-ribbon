"use client";

import { useState, lazy, Suspense } from "react";
import CareCompassForm from "./components/CareCompassForm";
import type { AnalyzeResponse } from "./lib/api";

const SimulationResults = lazy(() => import("./components/SimulationResults"));
const HospitalResults = lazy(() => import("./components/HospitalResults"));

type Tab = "simulation" | "hospitals";

export default function Home() {
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [tab, setTab] = useState<Tab>("simulation");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">CareCompass</h1>
        <p className="text-stone-600 mb-8 max-w-2xl">
          End-to-end breast cancer treatment simulator. Ranks treatment plans using
          Monte Carlo simulation, then recommends nearby hospitals. 0–5 year horizon.
          No life expectancy. Data: SEER, CMS, PubMed. No paid APIs.
        </p>

        <CareCompassForm setResults={setResults} onComplete={() => setTab("simulation")} />

        {results && (
          <div className="mt-10">
            {/* ── Tabs ── */}
            <div className="flex border-b border-stone-300 mb-6">
              <button
                onClick={() => setTab("simulation")}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
                  tab === "simulation"
                    ? "border-stone-800 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                Simulation Results
              </button>
              <button
                onClick={() => setTab("hospitals")}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
                  tab === "hospitals"
                    ? "border-stone-800 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                Hospitals Near You
              </button>
            </div>

            {/* ── Tab content ── */}
            <Suspense fallback={<div className="h-64 animate-pulse bg-stone-100 rounded-lg" />}>
              {tab === "simulation" && <SimulationResults data={results} />}
              {tab === "hospitals" && <HospitalResults data={results} />}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
