"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">CareCompass</h1>
        <p className="text-stone-600 mb-10">
          Location-aware breast cancer treatment simulator. Compare 5-year
          outcomes at nearby hospitals. Projections are probabilistic and based
          on public registry data and hospital-level treatment patterns.
        </p>

        <Link
          href="/intake"
          className="inline-block px-6 py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 transition"
        >
          Start patient intake
        </Link>

        <p className="mt-10 text-xs text-stone-500 max-w-md">
          No life expectancy is modeled. 0–5 year horizon only. Data: SEER,
          CMS, PubMed. No paid APIs. Treatment patterns are inferred proxies,
          not exact tumor board decisions.
        </p>
      </div>
    </div>
  );
}
