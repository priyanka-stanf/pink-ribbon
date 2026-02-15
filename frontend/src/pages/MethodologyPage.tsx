import React from 'react';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';

export function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#E0F2F1] py-16 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How PinkRibbon Projects <span className="text-[#00BFB3]">Breast Cancer Treatment Outcomes</span>
          </h1>
          <p className="text-xl text-slate-600">
            A transparent explanation of our Monte Carlo simulation for 0-5 year treatment pathway projection, model assumptions, and limitations.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12 space-y-16">
        {/* Core Modeling Approach */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-[#00BFB3]" />
            The Core Modeling Approach
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-[#00BFB3] text-white">Step 1</Badge>
                  Define Treatment Pathways & Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  We model 7 discrete treatment pathways for breast cancer. Pathway eligibility is determined by stage and subtype:
                </p>
                <div className="bg-slate-100 p-6 rounded-lg text-sm space-y-3">
                  <div><strong>Stage I-II, HR+:</strong> Lumpectomy+Radiation, Mastectomy±Recon, Endocrine Therapy, Clinical Trial</div>
                  <div><strong>Stage I-II, HER2+:</strong> Lumpectomy+Radiation, Mastectomy±Recon, HER2-Targeted, Clinical Trial</div>
                  <div><strong>Stage I-II, TNBC:</strong> Lumpectomy+Radiation, Mastectomy±Recon, Chemotherapy+Surgery, Clinical Trial</div>
                  <div><strong>Stage III:</strong> Mastectomy±Recon, Chemotherapy+Surgery, Endocrine (HR+), HER2-Targeted (HER2+), Clinical Trial</div>
                  <div><strong>Stage IV:</strong> Chemotherapy+Surgery, Endocrine (HR+), HER2-Targeted (HER2+), Clinical Trial</div>
                </div>
                <p className="text-slate-700 mt-4">
                  If stage or subtype is unknown, we sample from SEER age-conditional distributions.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-[#00BFB3] text-white">Step 2</Badge>
                  Parameter Estimation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">For each treatment pathway, we extract parameters from validated sources:</p>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="seer">
                    <AccordionTrigger>SEER Epidemiology (Baseline Risk)</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Stage distribution by age (e.g., age 18-49: 42% Stage I, 38% Stage II, 15% Stage III, 5% Stage IV)</li>
                        <li>Subtype distribution by age (HR+ ~75%, HER2+ ~15%, TNBC ~12%)</li>
                        <li>Baseline 5-year recurrence probability by stage (sampled from SEER survival data)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pubmed">
                    <AccordionTrigger>PubMed/RCTs (Treatment Effects)</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Hazard ratios for recurrence by pathway (e.g., HER2-targeted therapy: HR=0.60)</li>
                        <li>Acute symptom rates (e.g., chemotherapy: nausea 70%, fatigue 85%, neuropathy 45%)</li>
                        <li>Persistent symptom rates (e.g., 30% of neuropathy persists beyond 6 months)</li>
                        <li>Utility weights for quality-of-life adjustments (EQ-5D from literature)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cms">
                    <AccordionTrigger>CMS Data (Costs & Hospital Quality)</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Procedure cost distributions (mean, CV): lumpectomy $8,500±15%, mastectomy+recon $28,000±22%, HER2-targeted therapy $45,000±35%/year</li>
                        <li>Regional cost modifiers by ZIP code</li>
                        <li>Hospital quality ratings and MSPB scores for hospital search</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-[#00BFB3] text-white">Step 3</Badge>
                  Run the Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  We run <strong>5,000 virtual "patients"</strong> through each eligible pathway:
                </p>
                <div className="bg-slate-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`For each simulation run (N = 5,000 per pathway):
    1. Sample baseline 5y recurrence prob ~ SEER(stage)
    2. Apply pathway hazard ratio (e.g., HR=0.60 for HER2-targeted)
       → p_recur = min(0.99, baseline_prob * HR)
    3. Sample recurrence event ~ Bernoulli(p_recur)
    4. Sample acute symptoms (first 6 months):
       - nausea, fatigue, neuropathy, etc.
       ~ Bernoulli(symptom_rate_from_literature)
    5. For each acute symptom, sample persistence (months 6-60)
       ~ Bernoulli(persistent_rate)
    6. Calculate utility per month based on symptoms
       → QALM = sum of monthly utilities over 60 months
    7. Count months with utility < 0.90 as symptom_months
    8. Sample pathway cost ~ LogNormal(mean, cv) * regional_modifier
    9. Check for major long-term effects (LTE)
    10. Record: recurrence_5y, symptom_months, QALM, cost, major_LTE`}</pre>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Output per pathway:</strong> Distribution of 5,000 outcomes → median, IQR, 95% CI for recurrence risk, symptom burden, QALM, cost. Pathways are compared side-by-side.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Breast Cancer Model */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Breast Cancer Model Specification</h2>

          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Time Horizon</h3>
                <p className="text-slate-700">0-5 years (60 months) post-diagnosis. <strong>No life expectancy modeling</strong>—focused on treatment pathway outcomes only.</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Primary Outcomes (5 dimensions)</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li><strong>5-Year Recurrence Probability:</strong> Bernoulli event (yes/no) from baseline × pathway HR</li>
                  <li><strong>Symptom Burden:</strong> Months (0-60) with utility &lt; 0.90 (moderate/severe symptoms)</li>
                  <li><strong>Quality-Adjusted Life Months (QALM):</strong> Sum of monthly utilities over 60 months</li>
                  <li><strong>Treatment Costs:</strong> Sampled from CMS cost distributions (USD)</li>
                  <li><strong>Major Long-Term Effects (LTE):</strong> Binary indicator for serious persistent complications</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Key Input Parameters</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Patient Factors (user-provided or sampled):</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Age (18-100; affects stage/subtype distributions if unknown)</li>
                      <li>Stage at diagnosis (I, II, III, IV, or unknown → sampled from SEER)</li>
                      <li>ER/PR/HER2 status (determines subtype: HR+, HER2+, TNBC)</li>
                      <li>Menopausal status (pre/post/unknown)</li>
                      <li>ZIP code (for regional cost adjustment and hospital search)</li>
                      <li>Fertility preservation concerns (optional flag)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Treatment Pathway Parameters (from literature):</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Hazard ratios for recurrence (e.g., HER2-targeted: HR=0.60, endocrine: HR=0.70)</li>
                      <li>Acute symptom rates (nausea, fatigue, neuropathy, etc.) from RCTs</li>
                      <li>Persistent symptom probabilities (e.g., 30% of neuropathy persists)</li>
                      <li>Utility weights for symptom combinations (from EQ-5D literature)</li>
                      <li>Cost distributions by procedure (mean, CV) from CMS</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Hospital Search (optional):</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Hospital quality ratings (1-5 stars) from CMS Hospital Compare</li>
                      <li>MSPB scores (cost efficiency: &lt;1.0 = below avg cost, &gt;1.0 = above avg)</li>
                      <li>Mortality, safety, readmission comparison scores</li>
                      <li>Geographic proximity (ZIP3 matching)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Assumptions & Limitations */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Assumptions & Limitations</h2>
          
          <div className="space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-green-900">What We Assume ✓</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      assumption: 'CMS data is representative',
                      note: 'Hospital performance on Medicare patients generalizes to all patients',
                      limitation: 'Medicare patients are older; outcomes may differ for younger patients'
                    },
                    {
                      assumption: 'Past performance predicts future',
                      note: "Hospital's historical data predicts current capability",
                      limitation: 'Hospitals change staff, protocols, equipment'
                    },
                    {
                      assumption: 'Averaging unknown factors',
                      note: "We use population averages for factors we don't know about you",
                      limitation: 'You might be higher or lower risk than average'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-900">{item.assumption}</p>
                      <p className="text-sm text-slate-700 mt-1">{item.note}</p>
                      <p className="text-sm text-red-700 mt-2">
                        <strong>Limitation:</strong> {item.limitation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
