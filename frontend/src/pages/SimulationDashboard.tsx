import { useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowLeft, Info, Award, User, MapPin, AlertTriangle, Heart, Calendar, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectionResult, PATHWAY_NAMES, calculateBestTreatment } from '../lib/api';

const SIMULATION_STORAGE_KEY = 'pinkribbon_simulation_results';

// Treatment-specific supportive guidance
const TREATMENT_GUIDANCE: Record<string, {
  whatToExpect: string;
  affirmation: string;
  supportResources: string[];
  icon: typeof Heart;
}> = {
  lumpectomy_radiation: {
    whatToExpect: "You'll typically have a lumpectomy surgery first to remove the tumor while preserving your breast tissue. Recovery from surgery is usually 1-2 weeks. After healing, you'll have radiation therapy—usually 5 days a week for 3-6 weeks. The daily sessions take about 15-30 minutes, and most people continue their normal routines during treatment.",
    affirmation: "This breast-conserving option has excellent success rates. While the daily radiation visits may feel like a lot at first, many patients find they adjust to the routine quickly. You're preserving your breast tissue while getting highly effective treatment—that's something to feel good about.",
    supportResources: [
      "Ask about oncology social workers who can help coordinate transportation to daily radiation appointments",
      "Consider joining a breast cancer support group—many meet virtually now",
      "Look into gentle exercises and skin care routines specifically for radiation patients"
    ],
    icon: Heart
  },
  mastectomy_no_recon: {
    whatToExpect: "You'll have surgery to remove breast tissue, typically requiring a 1-2 night hospital stay. Recovery at home usually takes 2-4 weeks before returning to most activities. You may have surgical drains for 1-2 weeks. Many people choose prosthetics or go flat—both are valid, empowering choices.",
    affirmation: "This is a powerful, proactive choice that significantly reduces recurrence risk. Your body is strong, and you're taking control of your health journey. Many patients report feeling relief and empowerment after this decision. Healing takes time, but you're giving yourself the best chance at a healthy future.",
    supportResources: [
      "Connect with flat closure advocacy groups and communities who celebrate this choice",
      "Explore beautiful prosthetic options if interested—many are covered by insurance",
      "Ask your surgeon about 'flat closure' techniques if going flat is your choice",
      "Physical therapy can help restore arm and shoulder mobility after surgery"
    ],
    icon: Award
  },
  mastectomy_recon: {
    whatToExpect: "You'll have mastectomy surgery followed by reconstruction—either immediate (same surgery) or delayed (later). Hospital stay is typically 1-3 nights. Recovery varies but usually 4-6 weeks for initial healing. If using implants, you may need tissue expander adjustments every 2-3 weeks. Flap reconstruction involves a longer surgery but may feel more natural long-term.",
    affirmation: "You're not just treating cancer—you're reclaiming your sense of self. Reconstruction is a personal journey, and there's no rush. Your plastic surgeon and oncology team will work together to create a plan that honors both your health and your vision for your body. You deserve to feel whole and confident.",
    supportResources: [
      "Schedule consultations with board-certified plastic surgeons who specialize in breast reconstruction",
      "Join reconstruction support groups to see real experiences and results",
      "Ask about 'previvor' programs and what to expect with tissue expanders if applicable",
      "Occupational therapy can help with daily activities during recovery"
    ],
    icon: Heart
  },
  chemotherapy_plus_surgery: {
    whatToExpect: "Chemotherapy is typically given in cycles over 3-6 months, with infusions every 1-3 weeks at a treatment center. Each session takes a few hours, and side effects peak 2-5 days after infusion, then improve. Surgery follows once chemo is complete. You'll likely need help with daily tasks during the first few days after each treatment.",
    affirmation: "Yes, chemotherapy is challenging—but you're stronger than you know. This treatment is working hard to eliminate cancer cells throughout your body. Many patients find their own rhythm with chemo cycles and discover unexpected resilience. After some time, your energy will return, your hair will grow back, and you'll carry the strength of knowing you fought hard and won.",
    supportResources: [
      "Ask about anti-nausea medications before your first infusion—modern options are very effective",
      "Connect with a chemotherapy support network or buddy system",
      "Consider 'cold caps' to reduce hair loss if important to you",
      "Discuss flexible work arrangements or short-term disability options",
      "Nutritionists specializing in oncology can help maintain strength during treatment"
    ],
    icon: Award
  },
  endocrine_therapy: {
    whatToExpect: "You'll take a daily pill (like tamoxifen or an aromatase inhibitor) for 5-10 years. Regular check-ins with your oncologist every 3-6 months help monitor how you're feeling. Some people experience menopausal-like symptoms, joint aches, or mood changes—but many have minimal side effects. The long duration works in your favor, continuously protecting you.",
    affirmation: "Taking a daily pill for years requires real commitment, and that matters. You're actively preventing recurrence every single day. If side effects arise, know that there are different medications and supportive therapies to try. This long-term protection is giving you years of healthy life ahead—that's worth celebrating.",
    supportResources: [
      "Join endocrine therapy support groups to share tips for managing side effects",
      "Ask about bone density monitoring and calcium supplements if on aromatase inhibitors",
      "Explore exercise programs designed for people on long-term hormone therapy",
      "Consider counseling if mood changes occur—they're manageable and temporary"
    ],
    icon: Heart
  },
  her2_targeted: {
    whatToExpect: "HER2-targeted therapy (like Herceptin/trastuzumab or Perjeta) is given by IV infusion, typically every 3 weeks for about a year. The first infusion takes longer (90 minutes), then subsequent ones are usually 30-60 minutes. Side effects are generally milder than traditional chemo—many people work and maintain normal activities throughout treatment.",
    affirmation: "You have HER2-positive cancer, which means you can benefit from these incredibly effective targeted therapies. This is precision medicine at work—attacking cancer cells while largely sparing healthy ones. The year of treatment will pass, and you'll emerge with excellent protection against recurrence. You're in good hands.",
    supportResources: [
      "Ask about home healthcare options—some targeted therapies can be given at home",
      "Join HER2-positive patient communities to connect with others on the same path",
      "Request cardiac monitoring—it's routine and ensures your heart stays healthy during treatment",
      "Explore patient assistance programs if cost is a concern"
    ],
    icon: Award
  },
  clinical_trial: {
    whatToExpect: "Clinical trials offer access to cutting-edge treatments not yet widely available. You'll receive close monitoring with frequent check-ins and tests. The trial team will explain exactly what to expect—schedule, side effects, and what's known vs. experimental. You can leave a trial at any time if it's not right for you.",
    affirmation: "Choosing a clinical trial is courageous—you're helping yourself while advancing science for future patients. Trial participants often receive exceptional care with extra attention from medical teams. You're a pioneer in cancer treatment, and your contribution matters deeply. Whatever happens, you're part of something bigger.",
    supportResources: [
      "Ask detailed questions about the trial protocol and what's standard care vs. experimental",
      "Connect with clinical trial navigators who can explain everything in plain language",
      "Join advocacy groups for clinical trial participants",
      "Know your rights—you can withdraw from a trial at any time"
    ],
    icon: Award
  }
};

export function SimulationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get results from navigation state first, then from localStorage
  const getProjectionResults = (): ProjectionResult | null => {
    const stateResults = location.state?.projectionResults as ProjectionResult | undefined;
    if (stateResults) return stateResults;

    try {
      const stored = localStorage.getItem(SIMULATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ProjectionResult;
      }
    } catch (err) {
      console.error('Error loading simulation results from localStorage:', err);
    }
    return null;
  };

  const projectionResults = getProjectionResults();

  // Save results to localStorage when they come from navigation state
  useEffect(() => {
    if (location.state?.projectionResults) {
      try {
        localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(location.state.projectionResults));
      } catch (err) {
        console.error('Error saving simulation results to localStorage:', err);
      }
    }
  }, [location.state?.projectionResults]);

  // If no results, redirect to profile page
  if (!projectionResults) {
    navigate('/profile');
    return null;
  }

  const bestPathway = calculateBestTreatment(projectionResults.pathways);

  // Prepare bar chart data - show recurrence probability from Monte Carlo simulation
  const chartData = useMemo(() => {
    return projectionResults.pathways.map(pathway => ({
      pathway: pathway.pathway,
      name: PATHWAY_NAMES[pathway.pathway] || pathway.pathway,
      recurrenceRate: pathway.probability_recurrence_5y * 100, // Show actual recurrence % from backend
      isBest: pathway.pathway === bestPathway
    }));
  }, [projectionResults.pathways, bestPathway]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm backdrop-blur bg-white/90">
        <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                 <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
               </Button>
               <h1 className="text-xl md:text-2xl font-bold text-slate-900">Treatment Pathway Comparison</h1>
             </div>
           </div>

           {/* Profile Summary */}
           <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 ml-2 md:ml-12 bg-slate-50 p-2 rounded-md border border-slate-100 inline-flex">
              <span className="flex items-center gap-1 font-medium text-slate-900"><User className="h-3 w-3" /> Monte Carlo Results:</span>
              <span>{projectionResults.monte_carlo_n_iterations.toLocaleString()} iterations</span>
              <span className="text-slate-300">|</span>
              <span>{projectionResults.stage_sampled} / {projectionResults.subtype_sampled}</span>
              <span className="text-slate-300">|</span>
              <span>{projectionResults.horizon_years}-year projection</span>
              <Button variant="link" className="h-auto p-0 text-[#00BFB3] text-xs ml-2" onClick={() => navigate('/profile')}>Edit Profile</Button>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Introduction */}
        <div className="bg-gradient-to-r from-[#E91E63] to-[#D81B60] rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Your Personalized Treatment Pathways</h2>
          <p className="text-base text-pink-50">
            Based on {projectionResults.monte_carlo_n_iterations.toLocaleString()} Monte Carlo simulations tailored to your profile,
            we've analyzed all available treatment pathways. The recommended treatment is the one with the <strong>lowest 5-year recurrence probability</strong> from the simulation results.
          </p>
        </div>

        {/* Main Comparison Chart */}
        <Card className="shadow-xl border-t-4 border-t-[#00BFB3]">
          <CardHeader>
            <CardTitle className="text-2xl">5-Year Recurrence Probability by Pathway</CardTitle>
            <CardDescription>
              Direct results from Monte Carlo simulation. Lower is better. The recommended pathway (lowest recurrence) is highlighted in pink.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Recurrence Probability (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 'auto']}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border-2 border-slate-200 shadow-lg rounded-lg">
                            <p className="font-bold text-slate-900 mb-2">{data.name}</p>
                            {data.isBest && (
                              <Badge className="mb-2 bg-[#E91E63] text-white">Recommended (Lowest)</Badge>
                            )}
                            <div className="text-sm">
                              <p className="font-semibold text-slate-700">5-Year Recurrence: {data.recurrenceRate.toFixed(1)}%</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="recurrenceRate" name="5-Year Recurrence Probability">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isBest ? '#E91E63' : '#94a3b8'}
                        stroke={entry.isBest ? '#D81B60' : 'transparent'}
                        strokeWidth={entry.isBest ? 3 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Best Treatment Callout */}
            {bestPathway && (
              <div className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-[#E91E63] rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#E91E63] rounded-full">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Recommended: {PATHWAY_NAMES[bestPathway] || bestPathway}
                    </h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Based on your profile and our Monte Carlo analysis, this pathway has the lowest predicted 5-year recurrence probability.
                    </p>

                    {/* Treatment Guidance */}
                    {TREATMENT_GUIDANCE[bestPathway] && (
                      <div className="mt-6 space-y-6 animate-in fade-in duration-300">
                        {/* What to Expect */}
                        <div className="bg-white rounded-lg p-5 border border-pink-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-[#E91E63] mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2 text-base">What to Expect</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {TREATMENT_GUIDANCE[bestPathway].whatToExpect}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Affirmation */}
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-5 border border-pink-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-[#E91E63] mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2 text-base">You've Got This</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {TREATMENT_GUIDANCE[bestPathway].affirmation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Support Resources */}
                        <div className="bg-white rounded-lg p-5 border border-pink-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-[#E91E63] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-3 text-base">Support & Resources</h4>
                              <ul className="space-y-2">
                                {TREATMENT_GUIDANCE[bestPathway].supportResources.map((resource, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-[#E91E63] font-bold mt-1">•</span>
                                    <span className="leading-relaxed">{resource}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Find Centers CTA - Moved here beneath the chart */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center md:text-left relative overflow-hidden text-white shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                 <h2 className="text-3xl font-bold">Ready to Find Treatment Centers?</h2>
                 <p className="text-slate-300 text-lg">
                   Now that you know which pathway is best for you, find top-rated hospitals and treatment centers
                   near you that offer {bestPathway && PATHWAY_NAMES[bestPathway]}.
                 </p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00BFB3] to-[#00A69C] hover:from-[#00A69C] hover:to-[#008f85] text-white font-bold text-lg px-8 py-6 h-auto shadow-lg shadow-teal-500/20 whitespace-nowrap"
                onClick={() => navigate('/find-centers', { state: { bestPathway } })}
              >
                Find Treatment Centers <MapPin className="ml-2 h-5 w-5" />
              </Button>
           </div>
        </div>

        {/* Detailed Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Pathway Metrics</CardTitle>
            <CardDescription>
              Comprehensive breakdown of each treatment pathway's expected outcomes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-slate-700">Pathway</th>
                    <th className="text-center p-3 font-semibold text-slate-700">5-Yr Recurrence</th>
                    <th className="text-center p-3 font-semibold text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        Major Side Effects
                        <span
                          className="inline-flex cursor-help"
                          title="Probability of experiencing a major long-term side effect (cardiotoxicity, infertility, or neuropathy) that persists beyond the acute treatment phase"
                        >
                          <Info className="h-4 w-4 text-slate-400" />
                        </span>
                      </div>
                    </th>
                    <th className="text-center p-3 font-semibold text-slate-700">Median Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionResults.pathways.map((pathway) => {
                    const isBest = pathway.pathway === bestPathway;
                    return (
                      <tr
                        key={pathway.pathway}
                        className={`border-b border-slate-100 ${isBest ? 'bg-pink-50 border-l-4 border-l-[#E91E63]' : ''}`}
                      >
                        <td className="p-3 font-medium">
                          {PATHWAY_NAMES[pathway.pathway] || pathway.pathway}
                          {isBest && (
                            <Badge className="ml-2 bg-[#E91E63] text-white text-xs">Best</Badge>
                          )}
                        </td>
                        <td className="text-center p-3">
                          <span className="font-semibold">{(pathway.probability_recurrence_5y * 100).toFixed(1)}%</span>
                          <br />
                          <span className="text-xs text-slate-500">
                            ({(pathway.probability_recurrence_5y_95_si_low * 100).toFixed(1)}% - {(pathway.probability_recurrence_5y_95_si_high * 100).toFixed(1)}%)
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className={`font-semibold ${pathway.probability_major_long_term_side_effect < 0.15 ? 'text-green-600' : pathway.probability_major_long_term_side_effect < 0.30 ? 'text-amber-600' : 'text-red-600'}`}>
                            {(pathway.probability_major_long_term_side_effect * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center p-3 font-semibold">
                          ${pathway.cost_distribution.median.toLocaleString()}
                          <br />
                          <span className="text-xs text-slate-500">
                            (IQR: ${pathway.cost_distribution.q1.toLocaleString()} - ${pathway.cost_distribution.q3.toLocaleString()})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                <strong>Major Side Effects:</strong> This percentage shows the likelihood of experiencing persistent cardiotoxicity (heart damage), infertility, or neuropathy (nerve damage) that continues beyond the acute treatment phase. Lower percentages are better.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[#00BFB3]" />
                About This Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>
                <strong>Iterations:</strong> {projectionResults.monte_carlo_n_iterations.toLocaleString()} simulations
              </p>
              <p>
                <strong>Computation Time:</strong> {projectionResults.monte_carlo_computation_seconds.toFixed(2)} seconds
              </p>
              <p>
                <strong>Time Horizon:</strong> {projectionResults.horizon_years} years
              </p>
              <p>
                <strong>Data Sources:</strong> {projectionResults.data_provenance}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p>
                This simulation is a decision support tool based on statistical models and population data.
                It should not replace consultation with your oncology team. Individual outcomes may vary based
                on factors not captured in this model. Always discuss treatment options with your healthcare providers.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
