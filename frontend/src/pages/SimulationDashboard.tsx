import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Legend,
  ScatterChart, Scatter, ZAxis, Cell,
  LineChart, Line
} from 'recharts';
import { ArrowLeft, Share2, Download, Info, AlertTriangle, Clock, MapPin, Building2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HOSPITALS, MOCK_SIMULATION_DATA } from '../data/mockData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';

export function SimulationDashboard() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const hospital = HOSPITALS.find(h => h.id === hospitalId) || HOSPITALS[0];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading calculation
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-64 space-y-4">
          <div className="h-2 bg-slate-200 rounded overflow-hidden">
            <div className="h-full bg-[#00BFB3] animate-[width_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
          </div>
          <p className="text-center text-slate-500 text-sm font-medium">Running 5,000 Monte Carlo simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                 <ArrowLeft className="h-4 w-4 mr-2" /> Back
               </Button>
               <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
               <Badge variant={hospital.type === 'Comprehensive Stroke Center' ? 'success' : 'secondary'}>{hospital.type}</Badge>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
               <Button className="bg-[#00BFB3] hover:bg-[#00A69C]" size="sm">Run New Simulation</Button>
             </div>
           </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="bg-white border-b mb-8">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="border-r border-slate-100 last:border-0 px-4">
             <div className="text-sm text-slate-500 mb-1">90-Day Independence</div>
             <div className="text-3xl font-bold text-[#00BFB3]">{hospital.metrics.independence90Day}% <span className="text-sm font-normal text-slate-400">±{hospital.metrics.independence90DayCI}%</span></div>
           </div>
           <div className="border-r border-slate-100 last:border-0 px-4">
             <div className="text-sm text-slate-500 mb-1">Mortality Rate</div>
             <div className="text-3xl font-bold text-slate-700">{hospital.metrics.mortality30Day}%</div>
           </div>
           <div className="border-r border-slate-100 last:border-0 px-4">
             <div className="text-sm text-slate-500 mb-1">Est. Out-of-Pocket</div>
             <div className="text-3xl font-bold text-slate-700">${hospital.metrics.estOutOfPocket}</div>
           </div>
            <div className="px-4">
             <div className="text-sm text-slate-500 mb-1">Door-to-Needle</div>
             <div className="text-3xl font-bold text-slate-700">{hospital.metrics.doorToNeedle} <span className="text-sm font-normal text-slate-400">min</span></div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section A: Outcome Distribution */}
        <Card className="col-span-1 lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Probability Distribution of Your 90-Day Outcome</CardTitle>
            <CardDescription>Based on 5,000 Monte Carlo simulations using your profile and hospital data.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SIMULATION_DATA.distribution}>
                <defs>
                  <linearGradient id="colorY" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="33%" stopColor="#00BFB3" stopOpacity={0.8}/>
                    <stop offset="66%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="x" label={{ value: 'Modified Rankin Scale (0-6)', position: 'insideBottom', offset: -5 }} tickFormatter={(val) => val.toFixed(0)} />
                <YAxis label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="y" stroke="#00BFB3" fillOpacity={1} fill="url(#colorY)" />
                <ReferenceLine x={2} stroke="green" label="Independent" strokeDasharray="3 3" />
                <ReferenceLine x={4} stroke="orange" label="Disabled" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section B: Variance Decomposition */}
        <Card>
          <CardHeader>
             <CardTitle>What Drives Your Risk?</CardTitle>
             <CardDescription>Factors contributing to outcome variance.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {MOCK_SIMULATION_DATA.variance.map((item, index) => (
                 <div key={index} className="space-y-1">
                   <div className="flex justify-between text-sm font-medium">
                     <span className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                       {item.name}
                     </span>
                     <span>{item.value}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.fill }}></div>
                   </div>
                   <div className="text-xs text-slate-400 text-right">{item.type}</div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        {/* Section D: Time Impact */}
        <Card>
           <CardHeader>
             <CardTitle>Speed Matters: Treatment Timing</CardTitle>
             <CardDescription>Impact of delays on independence probability.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={MOCK_SIMULATION_DATA.timeImpact}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="time" label={{ value: 'Delay (min)', position: 'insideBottom', offset: -5 }} />
                 <YAxis domain={[0, 100]} />
                 <RechartsTooltip />
                 <Line type="monotone" dataKey="prob" stroke="#00BFB3" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                 <ReferenceLine x={45} stroke="red" label="Current Est." />
               </LineChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section C: Comparative Box Plot */}
        <Card className="col-span-1 lg:col-span-2">
           <CardHeader>
             <CardTitle>How Does This Compare?</CardTitle>
             <CardDescription>Outcome distribution and cost across area hospitals.</CardDescription>
           </CardHeader>
           <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                 data={MOCK_SIMULATION_DATA.boxPlot}
                 layout="horizontal"
                 margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
               >
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis 
                   type="number" 
                   domain={[0, 100]}
                   label={{ value: 'Treatment Success Rate (%)', position: 'insideBottom', offset: -10 }}
                 />
                 <YAxis 
                   type="category" 
                   dataKey="name"
                   label={{ value: 'Healthcare Facility', angle: -90, position: 'insideLeft', offset: 10 }}
                 />
                 <RechartsTooltip 
                   content={({ payload }) => {
                     if (payload && payload.length > 0) {
                       const data = payload[0].payload;
                       return (
                         <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                           <p className="font-bold text-slate-900">{data.fullName}</p>
                           <p className="text-sm text-slate-600">Median: {data.median}%</p>
                           <p className="text-sm text-slate-600">Range: {data.min}% - {data.max}%</p>
                           <p className="text-sm text-slate-600">Est. Cost: ${data.cost.toLocaleString()}</p>
                           <p className="text-xs text-slate-400 mt-1">{data.type}</p>
                         </div>
                       );
                     }
                     return null;
                   }}
                 />
                 {/* Error bars showing min-max range */}
                 <Bar dataKey="max" fill="transparent" stackId="a">
                   {MOCK_SIMULATION_DATA.boxPlot.map((entry, index) => (
                     <Cell key={`cell-${index}`} stroke={entry.isCurrent ? '#00BFB3' : '#94a3b8'} strokeWidth={2} />
                   ))}
                 </Bar>
                 {/* Main bar showing Q1-Q3 range */}
                 <Bar dataKey="median" fill="#00BFB3">
                   {MOCK_SIMULATION_DATA.boxPlot.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={entry.isCurrent ? '#00BFB3' : '#cbd5e1'}
                       stroke={entry.isCurrent ? '#00A69C' : '#94a3b8'}
                       strokeWidth={entry.isCurrent ? 3 : 1}
                     />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Section F: Best Next Moves */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="bg-teal-50 border-teal-200">
             <CardContent className="p-6">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin className="h-6 w-6 text-[#00BFB3]" />
                   </div>
                   <div>
                      <h4 className="font-bold text-teal-900">Expand Search Radius</h4>
                      <p className="text-sm text-teal-700 mt-1">Found a center 65 miles away with +14% success rate.</p>
                      <Button variant="link" className="px-0 text-[#00BFB3] font-bold">Update Search</Button>
                   </div>
                </div>
             </CardContent>
           </Card>
           
           <Card className="bg-white">
             <CardContent className="p-6">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-slate-100 rounded-lg shadow-sm">
                      <Building2 className="h-6 w-6 text-slate-600" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900">Consider Kaiser RWC</h4>
                      <p className="text-sm text-slate-600 mt-1">Similar outcome (+2pp) at $1,800 less cost.</p>
                      <Button variant="link" className="px-0 text-[#00BFB3] font-bold">View Hospital</Button>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-orange-50 border-orange-200">
             <CardContent className="p-6">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="h-6 w-6 text-orange-600" />
                   </div>
                   <div>
                      <h4 className="font-bold text-orange-900">Time is Critical</h4>
                      <p className="text-sm text-orange-800 mt-1">Calling 911 immediately saves 22 minutes vs. driving.</p>
                      <Button variant="link" className="px-0 text-orange-700 font-bold">Download Plan</Button>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Accordions */}
        <div className="col-span-1 lg:col-span-2">
           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="methodology">
                <AccordionTrigger>Simulation Methodology</AccordionTrigger>
                <AccordionContent>
                  Our model uses a probabilistic Monte Carlo simulation approach (N=5,000) based on CMS SAF data (2022-2023) and clinical trial meta-analyses. 
                  It adjusts for your age, sex, and comorbidities to estimate outcome distributions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="inputs">
                <AccordionTrigger>Your Personalized Inputs</AccordionTrigger>
                <AccordionContent>
                  Age: 45, Sex: Female, Diagnosis: Breast Cancer Stage II, Medical History: Hypertension.
                </AccordionContent>
              </AccordionItem>
           </Accordion>
        </div>

      </div>
    </div>
  );
}