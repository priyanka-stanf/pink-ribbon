import React from 'react';
import { Database, ExternalLink, CheckCircle2, AlertTriangle, Shield, RefreshCw, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function DataSourcesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#E0F2F1] py-16 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Transparency in <span className="text-[#00BFB3]">Healthcare Data</span>
          </h1>
        </div>
      </section>

      {/* Primary Data Sources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Primary Data Sources</h2>

          <div className="space-y-8">
            {/* SEER */}
            <Card className="border-l-4 border-l-[#00BFB3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-[#00BFB3]" />
                  1. SEER Program (Surveillance, Epidemiology, and End Results)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Stage distribution by age:</strong> e.g., age 18-49: 42% Stage I, 38% Stage II, 15% Stage III, 5% Stage IV</li>
                    <li><strong>Subtype distribution by age:</strong> HR+ ~75%, HER2+ ~15%, TNBC ~12% (varies by age)</li>
                    <li><strong>5-year relative survival by stage:</strong> Stage I: 99%, Stage II: 93%, Stage III: 75%, Stage IV: 29%</li>
                    <li><strong>10-year survival rates:</strong> Used for long-term outcome validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    SEER provides the baseline probabilities for our Monte Carlo model. When stage or subtype is unknown, we sample from these age-conditional distributions. The 5-year recurrence baseline (derived from SEER survival data) is the starting point before applying treatment-specific hazard ratios.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Free via SEER*Stat</Badge>
                  <Badge variant="secondary">NCI Operated</Badge>
                  <a href="https://seer.cancer.gov" target="_blank" rel="noopener noreferrer"
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    seer.cancer.gov <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* PubMed */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-blue-600" />
                  2. PubMed / NCBI E-utilities API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Treatment hazard ratios:</strong> e.g., HER2-targeted therapy HR=0.60, endocrine therapy HR=0.70 for recurrence</li>
                    <li><strong>Acute symptom rates from RCTs:</strong> chemotherapy-induced nausea (70%), fatigue (85%), neuropathy (45%)</li>
                    <li><strong>Persistent symptom probabilities:</strong> e.g., 30% of acute neuropathy persists beyond 6 months</li>
                    <li><strong>Utility weights for QALYs:</strong> EQ-5D scores for symptom combinations</li>
                    <li><strong>Clinical trial effect sizes:</strong> Confidence intervals for treatment efficacy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    PubMed provides the treatment effect modifiers applied to SEER baseline risks. Hazard ratios determine how much each pathway reduces recurrence probability. Symptom rates and utility weights calculate symptom burden and QALM. All parameters are extracted from meta-analyses and RCTs, not single studies.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Data Quality Safeguards:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 text-sm">
                    <li>Only include studies labeled as "meta-analysis" or "randomized controlled trial"</li>
                    <li>Apply recency filters (publication date within last decade)</li>
                    <li>Extract sample sizes and weight effect sizes proportionally</li>
                    <li>Require confidence intervals; discard studies without uncertainty bounds</li>
                    <li>Cross-validate against SEER population-level data</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Free (rate-limited)</Badge>
                  <Badge variant="secondary">API access</Badge>
                  <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer"
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    pubmed.ncbi.nlm.nih.gov <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* CMS */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  3. Centers for Medicare & Medicaid Services (CMS)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li><strong>Hospital General Information CSV:</strong> ~4,500 hospitals with quality ratings, ownership, emergency services</li>
                    <li><strong>Medicare Spending Per Beneficiary (MSPB) scores:</strong> Cost efficiency (1.0=national avg, &lt;1.0=lower cost, &gt;1.0=higher cost)</li>
                    <li><strong>Procedure cost distributions:</strong> Mean and CV for lumpectomy ($8,500±15%), mastectomy+recon ($28,000±22%), chemotherapy ($3,500/cycle±25%), HER2-targeted ($45,000/year±35%)</li>
                    <li><strong>Regional cost modifiers:</strong> Geographic adjustment factors by ZIP code/state</li>
                    <li><strong>Hospital quality metrics:</strong> Mortality, safety, readmission comparison scores</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    CMS cost distributions allow us to sample pathway costs realistically (not fixed values). Regional modifiers adjust for geographic variation. Hospital search uses CMS Hospital Compare data to show quality ratings and MSPB cost efficiency scores, helping patients identify high-quality, cost-effective facilities.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Free via data.cms.gov</Badge>
                  <Badge variant="secondary">~4,500 hospitals</Badge>
                  <a href="https://data.cms.gov" target="_blank" rel="noopener noreferrer"
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    data.cms.gov <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* NCCN/ASCO Guidelines */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  4. NCCN/ASCO Clinical Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Treatment pathway definitions (lumpectomy+radiation, mastectomy, etc.)</li>
                    <li>Eligibility criteria by stage and subtype</li>
                    <li>Standard-of-care treatment sequences</li>
                    <li>Clinical trial enrollment considerations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    NCCN/ASCO guidelines define which treatment pathways are clinically appropriate for each stage-subtype combination. This ensures our pathway eligibility logic matches real-world clinical practice (e.g., endocrine therapy only for HR+, HER2-targeted only for HER2+).
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Public guidelines</Badge>
                  <Badge variant="secondary">Evidence-based</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Data */}
      <section className="pt-8 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#00BFB3]" />
            Your Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-green-700">✓ We Don't Collect</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-slate-700 space-y-2">
                  <li>• Personal health information (PHI)</li>
                  <li>• Names, addresses, or identifiers</li>
                  <li>• Medical record numbers</li>
                  <li>• Social security numbers</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-[#00BFB3]">✓ What Stays Local</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-slate-700 space-y-2">
                  <li>• Your health profile inputs</li>
                  <li>• Simulation parameters</li>
                  <li>• Search history</li>
                  <li>• Saved comparisons</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
