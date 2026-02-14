
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { HOSPITALS } from '../data/mockData';
import { cn } from '../lib/utils';

export function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Fallback to first two hospitals if no state
  const selectedIds = location.state?.selectedIds || ['h1', 'h2']; 
  const hospitals = HOSPITALS.filter(h => selectedIds.includes(h.id));

  // If only 1 or 0 found (shouldn't happen in flow), fallback
  if (hospitals.length < 2) {
      return (
          <div className="p-8 text-center">
              <h2 className="text-xl font-bold">Please select at least 2 hospitals to compare.</h2>
              <Button onClick={() => navigate('/map')} className="mt-4">Back to Map</Button>
          </div>
      );
  }

  const [h1, h2] = hospitals;

  // Helper for comparison row
  const renderComparisonRow = (
    label: string, 
    val1: React.ReactNode, 
    val2: React.ReactNode, 
    better: 'h1' | 'h2' | 'equal' | 'none' = 'none',
    subLabel?: string
  ) => (
    <div className="grid grid-cols-3 border-b py-4 items-center">
      <div className="text-sm font-medium text-slate-600 px-4">
        {label}
        {subLabel && <div className="text-xs text-slate-400 font-normal">{subLabel}</div>}
      </div>
      <div className={cn("px-4 font-semibold text-slate-900 flex items-center gap-2", better === 'h1' ? "bg-green-50/50 -my-4 py-4 border-l-4 border-green-500" : "")}>
        {val1}
        {better === 'h1' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      </div>
      <div className={cn("px-4 font-semibold text-slate-900 flex items-center gap-2", better === 'h2' ? "bg-green-50/50 -my-4 py-4 border-l-4 border-green-500" : "")}>
        {val2}
        {better === 'h2' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white border-b px-4 py-4 shadow-sm">
        <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900">Comparing Treatment Centers</h1>
                </div>
                <Button variant="outline">Share Comparison</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="invisible">Label Column</div>
                <div className="font-bold text-lg text-slate-900 border-b-4 border-[#00BFB3] pb-2">
                    {h1.name}
                    <Badge variant="outline" className="ml-2 text-xs font-normal">{h1.type}</Badge>
                </div>
                <div className="font-bold text-lg text-slate-900 border-b-4 border-slate-300 pb-2">
                    {h2.name}
                    <Badge variant="outline" className="ml-2 text-xs font-normal">{h2.type}</Badge>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        {/* Recommendation Box */}
        <div className="my-8 bg-teal-50 border border-teal-100 rounded-lg p-6 flex items-start gap-4">
            <div className="bg-[#00BFB3] text-white p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-teal-900">Recommendation: {h1.metrics.independence90Day > h2.metrics.independence90Day ? h1.name : h2.name}</h3>
                <p className="text-teal-700">
                    Based on your priorities (70% outcome, 20% cost), {h1.metrics.independence90Day > h2.metrics.independence90Day ? h1.name : h2.name} is the better choice 
                    with a <span className="font-bold">{(Math.abs(h1.metrics.independence90Day - h2.metrics.independence90Day))}% higher independence probability</span>.
                </p>
            </div>
        </div>

        {/* Comparison Sections */}
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-4 bg-slate-50 py-2">Outcome Probabilities</h3>
                {renderComparisonRow(
                    "90-Day Independence", 
                    <div className="w-full">
                        <div className="flex justify-between text-sm mb-1"><span>{h1.metrics.independence90Day}%</span> <span className="text-slate-400">±{h1.metrics.independence90DayCI}%</span></div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#00BFB3]" style={{ width: `${h1.metrics.independence90Day}%` }}></div></div>
                    </div>,
                    <div className="w-full">
                         <div className="flex justify-between text-sm mb-1"><span>{h2.metrics.independence90Day}%</span> <span className="text-slate-400">±{h2.metrics.independence90DayCI}%</span></div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-slate-500" style={{ width: `${h2.metrics.independence90Day}%` }}></div></div>
                    </div>,
                    h1.metrics.independence90Day > h2.metrics.independence90Day ? 'h1' : 'h2'
                )}
                {renderComparisonRow(
                    "30-Day Mortality", 
                    <span className="text-slate-600">{h1.metrics.mortality30Day}%</span>,
                    <span className="text-slate-600">{h2.metrics.mortality30Day}%</span>,
                    h1.metrics.mortality30Day < h2.metrics.mortality30Day ? 'h1' : 'h2'
                )}
            </section>

             <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-4 bg-slate-50 py-2">CMS Performance & Quality</h3>
                {renderComparisonRow(
                    "Guideline Adherence", 
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#00BFB3]" /> {h1.metrics.cmsTreatmentRate}%</div>,
                    <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-slate-400" /> {h2.metrics.cmsTreatmentRate}%</div>,
                    h1.metrics.cmsTreatmentRate > h2.metrics.cmsTreatmentRate ? 'h1' : 'h2'
                )}
                {renderComparisonRow(
                    "Safety Grade (Leapfrog)", 
                    <Badge variant={h1.details.safetyGrade === 'A' ? 'success' : 'warning'}>{h1.details.safetyGrade}</Badge>,
                    <Badge variant={h2.details.safetyGrade === 'A' ? 'success' : 'warning'}>{h2.details.safetyGrade}</Badge>,
                    h1.details.safetyGrade < h2.details.safetyGrade ? 'h1' : (h1.details.safetyGrade > h2.details.safetyGrade ? 'h2' : 'equal')
                )}
                 {renderComparisonRow(
                    "Door-to-Needle Time", 
                    <span>{h1.metrics.doorToNeedle} min</span>,
                    <span>{h2.metrics.doorToNeedle} min</span>,
                    h1.metrics.doorToNeedle < h2.metrics.doorToNeedle ? 'h1' : 'h2'
                )}
            </section>

             <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-4 bg-slate-50 py-2">Cost & Access</h3>
                {renderComparisonRow(
                    "Est. Out-of-Pocket", 
                    <span className="font-bold">${h1.metrics.estOutOfPocket}</span>,
                    <span className="font-bold">${h2.metrics.estOutOfPocket}</span>,
                    h1.metrics.estOutOfPocket < h2.metrics.estOutOfPocket ? 'h1' : 'h2'
                )}
                 {renderComparisonRow(
                    "Distance", 
                    <span>{h1.distance} mi</span>,
                    <span>{h2.distance} mi</span>,
                    h1.distance < h2.distance ? 'h1' : 'h2'
                )}
                 {renderComparisonRow(
                    "Network Status", 
                    <span className={h1.isInNetwork ? "text-green-600" : "text-red-500"}>{h1.isInNetwork ? "In Network" : "Out of Network"}</span>,
                    <span className={h2.isInNetwork ? "text-green-600" : "text-red-500"}>{h2.isInNetwork ? "In Network" : "Out of Network"}</span>,
                    h1.isInNetwork && !h2.isInNetwork ? 'h1' : (!h1.isInNetwork && h2.isInNetwork ? 'h2' : 'equal')
                )}
            </section>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-40">
           <div className="container mx-auto grid grid-cols-3 gap-4">
              <div className="text-sm text-slate-500 flex items-center">
                 Select a hospital to simulate full outcomes.
              </div>
              <Button 
                className="w-full bg-[#00BFB3] hover:bg-[#00A69C]" 
                onClick={() => navigate(`/simulation/${h1.id}`)}
              >
                Simulate {h1.name}
              </Button>
              <Button 
                className="w-full bg-[#00BFB3] hover:bg-[#00A69C]"
                onClick={() => navigate(`/simulation/${h2.id}`)}
              >
                Simulate {h2.name}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
