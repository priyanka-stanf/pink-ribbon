import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, TrendingDown, ArrowRight, ShieldCheck, Clock, MapPin, DollarSign, Trophy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { HOSPITALS } from '../data/mockData';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const PRIORITIES_KEY = 'pinkribbon_priorities';

export function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get hospitals from navigation state, or fallback to mock data
  const selectedIds = location.state?.selectedIds || ['h1', 'h2'];
  const hospitals = location.state?.hospitals || HOSPITALS.filter(h => selectedIds.includes(h.id));

  // Load user priorities from localStorage (saved from ProfilePage)
  const loadPriorities = () => {
    try {
      const stored = localStorage.getItem(PRIORITIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading priorities:', err);
    }
    // Default priorities if none saved
    return { rating: 60, cost: 40 };
  };

  const priorities = loadPriorities();

  // Calculate Match Score
  const calculateMatchScore = (hospital: any) => {
    // Normalize metrics to 0-100 scale
    const ratingScore = (hospital.metrics.overallRating / 5) * 100;

    // Cost: Lower is better. Let's say 0.8 MSPB is 100%, 1.2 is 0%
    const costScore = Math.max(0, Math.min(100, (1.2 - hospital.metrics.mspbComparison) * 250));

    const totalScore = (
      (ratingScore * priorities.rating) +
      (costScore * priorities.cost)
    ) / 100;

    return Math.round(totalScore);
  };

  const hospitalsWithScore = hospitals.map(h => ({
    ...h,
    matchScore: calculateMatchScore(h)
  })).sort((a, b) => b.matchScore - a.matchScore); // Sort by winner

  const winner = hospitalsWithScore[0];

  if (hospitals.length < 2) {
      return (
          <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-800">Select Centers to Compare</h2>
              <p className="text-slate-500 mb-6">Please select at least 2 hospitals from the search page.</p>
              <Button onClick={() => navigate('/find-centers')} className="bg-[#E91E63] text-white">Back to Search</Button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/find-centers')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">Comparing {hospitals.length} Centers</h1>
            </div>
            
            {/* Top Cards Row */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="w-48 shrink-0 flex items-center justify-center text-slate-400 text-sm font-medium italic">
                   Based on your priorities:<br/>
                   Rating ({Math.round((priorities.rating / (priorities.rating + priorities.cost)) * 100)}%),
                   Cost ({Math.round((priorities.cost / (priorities.rating + priorities.cost)) * 100)}%)
                </div>
                
                {hospitalsWithScore.map((hospital) => (
                   <div key={hospital.id} className={cn("flex-1 min-w-[200px] border rounded-lg p-4 relative", hospital.id === winner.id ? "bg-white border-[#E91E63] shadow-md ring-1 ring-[#E91E63] mt-4" : "bg-white border-slate-200")}>
                      {hospital.id === winner.id && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E91E63] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                           <Trophy className="h-3 w-3" /> Recommended
                        </div>
                      )}
                      <div className="font-bold text-lg text-slate-900 truncate" title={hospital.name}>{hospital.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="flex items-center text-yellow-500">
                            <span className="font-bold text-slate-900 mr-1">{hospital.metrics.overallRating}</span>
                            <Star className="h-3 w-3 fill-current" />
                         </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                         <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", hospital.id === winner.id ? "bg-[#00BFB3]" : "bg-slate-400")} 
                              style={{ width: `${hospital.matchScore}%` }}
                            ></div>
                         </div>
                         <span className={cn("text-xs font-bold", hospital.id === winner.id ? "text-[#00BFB3]" : "text-slate-500")}>
                           {hospital.matchScore}% Match
                         </span>
                      </div>
                   </div>
                ))}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* 1. Overall Rating Comparison */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <Star className="h-5 w-5 text-yellow-500" /> Overall Quality Rating
               </h3>
            </div>
            <div className="grid grid-cols-[200px_1fr] divide-x divide-slate-100">
               <div className="p-6 text-sm text-slate-500 flex items-center">
                  CMS Overall Star Rating based on 50+ quality measures.
               </div>
               <div className="flex divide-x divide-slate-100 overflow-x-auto">
                  {hospitalsWithScore.map(h => (
                     <div key={h.id} className="flex-1 p-6 flex flex-col items-center justify-center min-w-[200px]">
                        <div className="flex gap-1 mb-2">
                           {[1,2,3,4,5].map(s => (
                             <Star key={s} className={cn("h-6 w-6", s <= Math.round(h.metrics.overallRating) ? "text-yellow-400 fill-current" : "text-slate-200")} />
                           ))}
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{h.metrics.overallRating}/5.0</div>
                        {h.metrics.overallRating >= 4.5 && <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Top Rated</Badge>}
                     </div>
                  ))}
               </div>
            </div>
        </section>

        {/* 2. Cost Effectiveness */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <DollarSign className="h-5 w-5 text-green-600" /> Cost Effectiveness
               </h3>
            </div>
            <div className="grid grid-cols-[200px_1fr] divide-x divide-slate-100">
               <div className="p-6 text-sm text-slate-500 flex items-center">
                  <p>Medicare Spending Per Beneficiary (MSPB)</p>
               </div>
               <div className="flex divide-x divide-slate-100 overflow-x-auto">
                  {hospitalsWithScore.map(h => (
                     <div key={h.id} className="flex-1 p-6 flex flex-col items-center justify-center min-w-[200px]">
                        {/* MSPB */}
                        <div className="text-center">
                           <div className={cn("inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full text-sm",
                              h.metrics.mspbComparison < 0.95 ? "bg-green-100 text-green-700" :
                              h.metrics.mspbComparison > 1.05 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                           )}>
                              {h.metrics.mspbComparison < 0.95 ? <TrendingDown className="h-4 w-4" /> :
                               h.metrics.mspbComparison > 1.05 ? <TrendingDown className="h-4 w-4 rotate-180" /> : <ArrowRight className="h-4 w-4" />}
                              {h.metrics.mspbComparison < 0.95 ? "Pay less than avg" :
                               h.metrics.mspbComparison > 1.05 ? "Pay more than avg" : "Average Cost"}
                           </div>
                           <p className="text-xs text-slate-400 mt-1">Index: {h.metrics.mspbComparison}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
        </section>

        {/* 3. Ratings Breakdown */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-blue-600" /> Quality Metrics Breakdown
               </h3>
            </div>
            <div className="grid grid-cols-[200px_1fr] divide-x divide-slate-100">
               <div className="p-6 text-sm text-slate-500 space-y-8 pt-10">
                  <div>Mortality</div>
                  <div>Safety of Care</div>
                  <div>Readmission</div>
               </div>
               <div className="flex divide-x divide-slate-100 overflow-x-auto">
                  {hospitalsWithScore.map(h => (
                     <div key={h.id} className="flex-1 p-6 min-w-[200px] space-y-8">
                        {[
                           { val: h.metrics.mortalityComparison, color: '#ef4444' },
                           { val: h.metrics.safetyComparison, color: '#3b82f6' },
                           { val: h.metrics.readmissionComparison, color: '#8b5cf6' }
                        ].map((metric, i) => (
                           <div key={i} className="flex items-center gap-2">
                              <span className="font-bold w-6">{metric.val}</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full rounded-full" style={{ width: `${(metric.val/5)*100}%`, backgroundColor: metric.val >= 4 ? '#22c55e' : (metric.val >=3 ? '#eab308' : '#ef4444') }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
        </section>

        {/* 4. Logistics */}
         <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-slate-600" /> Access & Logistics
               </h3>
            </div>
            <div className="grid grid-cols-[200px_1fr] divide-x divide-slate-100">
               <div className="p-6 text-sm text-slate-500 flex flex-col justify-center gap-6">
                  <p>Network Status</p>
                  <p>Hospital Type</p>
               </div>
               <div className="flex divide-x divide-slate-100 overflow-x-auto">
                  {hospitalsWithScore.map(h => (
                     <div key={h.id} className="flex-1 p-6 flex flex-col justify-center gap-6 min-w-[200px] text-center">
                        <div>
                           <Badge variant={h.isInNetwork ? 'success' : 'destructive'} className={h.isInNetwork ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {h.isInNetwork ? "In Network" : "Out of Network"}
                           </Badge>
                        </div>
                        <div className="text-sm text-slate-600">{h.type}</div>
                     </div>
                  ))}
               </div>
            </div>
        </section>

      </div>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-40">
           <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-500 hidden md:block">
                 We recommend <strong>{winner.name}</strong> based on your priorities.
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <Button variant="outline" onClick={() => navigate('/find-centers')} className="flex-1 md:flex-none">
                    Start Over
                 </Button>
                 <Button 
                   className="flex-1 md:flex-none bg-[#E91E63] hover:bg-[#D81B60] text-white shadow-lg shadow-pink-500/20"
                   onClick={() => navigate(`/simulate`)} // Should ideally preserve hospital context if simulating specific hospital
                 >
                   Simulate Treatments at {winner.name}
                 </Button>
              </div>
           </div>
        </div>

    </div>
  );
}
