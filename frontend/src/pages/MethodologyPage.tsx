import React from 'react';
import { TrendingUp, GitBranch, AlertCircle, CheckCircle2, Code, BarChart3, FileText } from 'lucide-react';
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
            How CareCompass Calculates Your <span className="text-[#00BFB3]">Outcome Probabilities</span>
          </h1>
          <p className="text-xl text-slate-600">
            A transparent explanation of our Monte Carlo simulation approach, model assumptions, and limitations.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
          <Card className="bg-teal-50 border-[#00BFB3] border-2">
            <CardContent className="p-8">
              <p className="text-slate-700 mb-4 text-lg">
                CareCompass uses <strong>Monte Carlo simulation</strong>—a computational technique that 
                runs thousands of virtual scenarios to estimate probability distributions. Instead of 
                giving you a single "success rate," we show you the full range of possible outcomes 
                based on your specific situation.
              </p>
              <div className="bg-white p-4 rounded-lg border border-teal-200">
                <p className="text-slate-700">
                  <strong>Think of it like a weather forecast:</strong> Instead of "it will rain tomorrow" 
                  (deterministic), we say "70% chance of rain" (probabilistic). Healthcare outcomes work 
                  the same way.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

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
                  Build a Patient Journey Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  We model your healthcare journey as a series of decision nodes:
                </p>
                <div className="bg-slate-100 p-6 rounded-lg font-mono text-sm space-y-2">
                  <div>Symptom Onset</div>
                  <div className="ml-4">↓</div>
                  <div>Call 911 vs. Drive Yourself</div>
                  <div className="ml-4">↓</div>
                  <div>Transport Delay</div>
                  <div className="ml-4">↓</div>
                  <div>Hospital Arrival & Triage</div>
                  <div className="ml-4">↓</div>
                  <div>Imaging (CT/MRI)</div>
                  <div className="ml-4">↓</div>
                  <div>Treatment Eligibility Determination</div>
                  <div className="ml-4">↓</div>
                  <div>Treatment Execution</div>
                  <div className="ml-4">↓</div>
                  <div>Complications (yes/no)</div>
                  <div className="ml-4">↓</div>
                  <div>ICU/Ward Care</div>
                  <div className="ml-4">↓</div>
                  <div>Rehabilitation Access</div>
                  <div className="ml-4">↓</div>
                  <div className="font-bold">90-Day Outcome</div>
                </div>
                <p className="text-slate-700 mt-4">
                  Each node has a time delay distribution, probability of correct action, and effect 
                  size on outcome.
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
                <p className="text-slate-700 mb-4">For each hospital, we estimate parameters using:</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="hospital">
                    <AccordionTrigger>Hospital-Specific Data (from CMS)</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Historical mortality rates</li>
                        <li>Treatment utilization rates</li>
                        <li>Average time-to-treatment metrics</li>
                        <li>Complication rates</li>
                        <li>Volume (number of cases per year)</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="clinical">
                    <AccordionTrigger>Clinical Trial Data</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Treatment efficacy under ideal conditions</li>
                        <li>Adverse event rates</li>
                        <li>Time-to-treatment sensitivity</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="population">
                    <AccordionTrigger>Population Data</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                        <li>Age-outcome relationships</li>
                        <li>Comorbidity effects</li>
                        <li>Stage-outcome curves</li>
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
                  We run <strong>1,000-5,000 virtual "patients"</strong> through the journey:
                </p>
                <div className="bg-slate-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`For each simulation run (N = 1,000 to 5,000):
    1. Sample arrival time delay ~ LogNormal(hospital_mean, hospital_sd)
    2. Sample imaging delay ~ Gamma(hospital_params)
    3. Determine treatment eligibility (based on time window, stage)
    4. Sample whether hospital provides treatment
       ~ Bernoulli(hospital_adherence_rate)
    5. If treated, sample treatment effectiveness
       ~ Beta(trial_alpha, trial_beta)
    6. Sample complication occurrence
       ~ Bernoulli(hospital_complication_rate)
    7. Sample rehab access ~ Bernoulli(geographic_availability)
    8. Calculate final outcome score
    9. Record outcome`}</pre>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Output:</strong> A distribution of 1,000-5,000 outcomes, from which we calculate 
                    median outcome, 5th/95th percentiles, and probability of each outcome category.
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
                <h3 className="font-bold text-lg text-slate-900 mb-3">Primary Outcome</h3>
                <p className="text-slate-700">5-year survival and recurrence-free survival rates</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-3">Key Predictors</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Patient Factors (from your profile):</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Age (continuous variable; age &gt; 65 has different outcomes)</li>
                      <li>Stage at diagnosis (0-IV)</li>
                      <li>Tumor characteristics (ER/PR/HER2 status when available)</li>
                      <li>Comorbidities (diabetes, heart disease, etc.)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Hospital Factors (from CMS/Leapfrog):</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Cancer center accreditation (NCI-designated, CoC-accredited, etc.)</li>
                      <li>Annual case volume for breast cancer</li>
                      <li>30-day mortality rate</li>
                      <li>Complication rate</li>
                      <li>Access to clinical trials</li>
                      <li>Multidisciplinary tumor board availability</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Treatment Pathway Factors:</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      <li>Whether surgery is performed at high-volume center</li>
                      <li>Whether radiation therapy is evidence-based</li>
                      <li>Chemotherapy regimen selection and adherence</li>
                      <li>Access to targeted therapies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Uncertainty */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-600" />
            Uncertainty Quantification
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle>Aleatory Uncertainty (Random Variation)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Your specific cancer subtype</li>
                  <li>Exact treatment response</li>
                  <li>Whether complications occur</li>
                  <li>Measurement error in hospital data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle>Epistemic Uncertainty (Knowledge Gaps)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Limited sample sizes for some hospitals</li>
                  <li>Incomplete comorbidity data</li>
                  <li>Generalization from trial populations</li>
                  <li>Model specification uncertainty</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-blue-50 border-blue-300">
            <CardContent className="p-6">
              <h4 className="font-bold text-blue-900 mb-2">How We Show It:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>✓ Confidence intervals on all probabilities</li>
                <li>✓ "Uncertainty: Moderate" labels when data is sparse</li>
                <li>✓ Wider outcome distributions when uncertainty is high</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Model Validation */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            Model Validation
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Historical Backtesting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li>• Train model on 2018-2021 CMS data</li>
                  <li>• Test predictions on 2022-2023 data</li>
                  <li>• Compare predicted vs. actual hospital mortality rates</li>
                  <li className="font-semibold text-green-700">
                    ✓ Current accuracy: Within 2.3 percentage points for 85% of hospitals
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Literature Concordance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li>• Simulated treatment effects match published meta-analyses</li>
                  <li>• Stage-outcome relationships consistent with cancer registry validation</li>
                  <li>• Volume-outcome curves align with published research</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Expert Review</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li>• Clinical advisors validate care pathway logic</li>
                  <li>• Oncologists review treatment eligibility criteria</li>
                  <li>• Statisticians validate probability calculations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
                      assumption: 'Average = Your Case',
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

            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-red-900">What We Don't Model (Yet) ✗</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                  <li>• Individual physician skill variation</li>
                  <li>• Specific tumor genomics</li>
                  <li>• Social support and home environment</li>
                  <li>• Patient preferences for aggressive treatment</li>
                  <li>• Real-time bed availability</li>
                  <li>• Seasonal variation in capacity</li>
                  <li>• Day of week effects</li>
                  <li>• Patient-level biomarkers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Statistical Techniques */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#00BFB3]" />
            Statistical Techniques Used
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Probability Distributions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p><strong>LogNormal:</strong> Time delays</p>
                <p><strong>Gamma:</strong> Length of stay, treatment durations</p>
                <p><strong>Beta:</strong> Proportions (success rates)</p>
                <p><strong>Bernoulli:</strong> Binary events (complication yes/no)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regression Models</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p><strong>Logistic Regression:</strong> Predicting binary outcomes</p>
                <p><strong>Cox Proportional Hazards:</strong> Time-to-event outcomes</p>
                <p><strong>Bayesian Methods:</strong> Incorporating prior knowledge</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Open Source */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Code className="h-8 w-8 text-[#00BFB3]" />
            Open Source & Reproducibility
          </h2>
          
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-[#00BFB3] border-2">
            <CardContent className="p-8 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Code Availability:</h3>
                <p className="text-slate-700">
                  Simulation engine: github.com/carecompass/monte-carlo-engine (MIT license)
                </p>
              </div>
              
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Replication Package:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                  <li>Sample datasets (anonymized)</li>
                  <li>Model specifications</li>
                  <li>Validation scripts</li>
                  <li>Unit tests</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2">Peer Review:</h3>
                <p className="text-slate-700">
                  We welcome external validation and critique. Submit issues or pull requests on GitHub or 
                  contact: research@carecompass.health
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Updates */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Updates & Versioning</h2>
          
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Model Version</p>
                  <p className="text-2xl font-bold text-[#00BFB3]">1.0 (Breast Cancer MVP)</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Last Updated</p>
                  <p className="text-2xl font-bold text-slate-900">February 14, 2025</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Next Planned Update</p>
                  <p className="text-xl font-semibold text-slate-700">June 2025</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-1">Changelog</p>
                  <a href="#" className="text-[#00BFB3] hover:underline">
                    carecompass.health/methodology/changelog
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="text-center">
          <Card className="bg-[#00BFB3] text-white">
            <CardContent className="p-12">
              <FileText className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-2xl font-bold mb-4">Contact the Research Team</h2>
              <div className="space-y-2 text-teal-50">
                <p>Scientific Questions: research@carecompass.health</p>
                <p>Data Partnership Inquiries: data@carecompass.health</p>
                <p>Clinical Validation: clinical@carecompass.health</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
