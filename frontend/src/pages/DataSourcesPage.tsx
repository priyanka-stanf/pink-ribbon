import React from 'react';
import { Database, ExternalLink, CheckCircle2, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
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
          <p className="text-xl text-slate-600">
            Every statistic, every probability, every recommendation—traced back to its source.
          </p>
        </div>
      </section>

      {/* Primary Data Sources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Primary Data Sources</h2>
          
          <div className="space-y-8">
            {/* CMS */}
            <Card className="border-l-4 border-l-[#00BFB3]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-[#00BFB3]" />
                  1. Centers for Medicare & Medicaid Services (CMS)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Hospital Compare / Care Compare database</li>
                    <li>30-day mortality rates by condition</li>
                    <li>30-day readmission rates</li>
                    <li>Hospital-acquired infection rates</li>
                    <li>Patient experience (HCAHPS) scores</li>
                    <li>Price transparency machine-readable files</li>
                    <li>Inpatient Prospective Payment System (IPPS) data</li>
                    <li>Procedure billing frequencies and utilization rates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    CMS data represents real-world outcomes from millions of actual patient encounters, 
                    not just clinical trial populations. The billing frequency data shows us whether 
                    hospitals actually provide guideline-recommended treatments in practice.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Quarterly updates</Badge>
                  <Badge variant="secondary">~4,500 hospitals</Badge>
                  <a href="https://data.cms.gov" target="_blank" rel="noopener noreferrer" 
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    data.cms.gov <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Leapfrog */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  2. The Leapfrog Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Hospital safety grades (A-F)</li>
                    <li>ICU physician staffing ratings</li>
                    <li>High-risk surgery volume standards</li>
                    <li>Medication safety practices</li>
                    <li>Infection control protocols</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    Leapfrog independently evaluates hospitals on structural safety factors that CMS 
                    doesn't always capture, like whether ICU patients have 24/7 intensivist coverage.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Bi-annual updates</Badge>
                  <Badge variant="secondary">~2,200 hospitals</Badge>
                  <a href="https://leapfroggroup.org" target="_blank" rel="noopener noreferrer" 
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    leapfroggroup.org <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* ClinicalTrials.gov */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  3. ClinicalTrials.gov
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Published results from randomized controlled trials</li>
                    <li>Treatment efficacy data for interventions</li>
                    <li>Adverse event rates</li>
                    <li>Inclusion/exclusion criteria to understand trial populations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    Clinical trials establish what's possible under ideal conditions. We use this as the 
                    "best case scenario" baseline, then adjust for real-world implementation gaps using 
                    CMS utilization data.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">Continuous updates</Badge>
                  <Badge variant="secondary">450,000+ trials</Badge>
                  <a href="https://clinicaltrials.gov" target="_blank" rel="noopener noreferrer" 
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    clinicaltrials.gov <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Cochrane */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-purple-600" />
                  4. Cochrane Library
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">What We Use:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                    <li>Systematic reviews and meta-analyses</li>
                    <li>Treatment effectiveness estimates</li>
                    <li>Evidence quality ratings (GRADE system)</li>
                    <li>Comparative effectiveness data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Why It Matters:</h4>
                  <p className="text-slate-700">
                    Cochrane reviews synthesize all available evidence on a treatment, providing more 
                    reliable estimates than individual studies.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary">2-5 year review cycles</Badge>
                  <Badge variant="secondary">8,000+ reviews</Badge>
                  <a href="https://cochranelibrary.com" target="_blank" rel="noopener noreferrer" 
                     className="text-[#00BFB3] hover:underline flex items-center gap-1 text-sm">
                    cochranelibrary.com <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Don't Have */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">What We Don't Have (Yet)</h2>
          
          <Card className="bg-amber-50 border-amber-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-amber-900">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                Limitations We're Transparent About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Physician-level data:</strong> We model hospital performance, not individual doctor outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Social determinants:</strong> Limited data on transportation access, housing stability, nutrition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Real-time availability:</strong> We use quarterly/annual snapshots, not live bed counts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All payers:</strong> Some insurance negotiated rates remain proprietary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Granular comorbidities:</strong> We use broad categories due to data aggregation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Patient-reported outcomes:</strong> Most registries focus on clinical endpoints, not quality of life</span>
                </li>
              </ul>
              <p className="text-slate-700 mt-4 font-medium">We're actively working to fill these gaps.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Quality */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Data Quality & Validation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Handling Missing Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>✓ Imputation using similar hospital characteristics</li>
                  <li>✓ Clearly mark estimates vs. reported values</li>
                  <li>✓ Wider confidence intervals when data is sparse</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Handling Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>✓ Prioritize more recent data sources</li>
                  <li>✓ Weight by sample size and quality</li>
                  <li>✓ Display ranges when sources disagree</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outlier Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>✓ Flag hospitals with implausible values</li>
                  <li>✓ Require manual review before inclusion</li>
                  <li>✓ Note data quality concerns in profiles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Data */}
      <section className="py-16 bg-[#E0F2F1]">
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

          <Card className="mt-8 bg-blue-50 border-blue-300">
            <CardContent className="p-6">
              <h4 className="font-bold text-slate-900 mb-2">What We Analyze Anonymously:</h4>
              <p className="text-slate-700 text-sm">
                Aggregate usage patterns (which features are used), search patterns (which conditions/locations), 
                and performance metrics (load times, errors). See our <a href="/privacy" className="text-[#00BFB3] hover:underline">Privacy Policy</a> for details.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Update Schedule */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#00BFB3]" />
            Data Updates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Real-Time</span>
                  <Badge>Live</Badge>
                </div>
                <p className="text-sm text-slate-600">Map locations, hospital addresses</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Weekly</span>
                  <Badge variant="secondary">7 days</Badge>
                </div>
                <p className="text-sm text-slate-600">Price transparency files</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Quarterly</span>
                  <Badge variant="secondary">90 days</Badge>
                </div>
                <p className="text-sm text-slate-600">CMS quality metrics</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Semi-Annually</span>
                  <Badge variant="secondary">6 months</Badge>
                </div>
                <p className="text-sm text-slate-600">Leapfrog safety grades</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">Annually</span>
                  <Badge variant="secondary">1 year</Badge>
                </div>
                <p className="text-sm text-slate-600">Full model recalibration</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-slate-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-600">Last full data refresh:</p>
                <p className="font-bold text-slate-900">February 14, 2025</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Next scheduled update:</p>
                <p className="font-bold text-slate-900">March 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
