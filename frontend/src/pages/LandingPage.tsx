import { motion } from 'motion/react';
import { MapPin, ShieldCheck, Activity, BarChart2, User, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FCE4EC] pb-24 pt-16 lg:pt-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E91E63_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl max-w-5xl mx-auto">
              See How Breast Cancer Treatment Plans <br className="hidden sm:inline" />
              <span className="text-[#E91E63]">Affect Your Long-Term Outcomes</span>
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-600 mx-auto">
              PinkRibbon uses Monte Carlo simulation to model 5-year outcomes across different treatment approaches, personalized to your profile.
            </p>
          </motion.div>

          {/* Primary CTA: Simulate Treatment Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-3xl mt-12"
          >
            <Card className="bg-white border-[#E91E63]/20 shadow-xl ring-1 ring-[#E91E63]/10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E91E63] to-[#00BFB3]"></div>
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="p-4 bg-pink-50 rounded-full ring-1 ring-pink-100">
                    <Zap className="h-10 w-10 text-[#E91E63]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Simulate Treatment Plans</h2>
                    <p className="text-slate-600 max-w-xl mx-auto">
                      Compare 5-year outcomes for lumpectomy+radiation, mastectomy, chemotherapy combinations, endocrine therapy, HER2 therapy, and clinical trials based on YOUR profile.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-[#E91E63] hover:bg-[#D81B60] text-white font-bold text-lg px-10 py-6 h-auto shadow-lg shadow-pink-500/20 rounded-full transition-all transform hover:scale-105"
                    onClick={() => navigate('/profile')}
                  >
                    Create Profile & Simulate
                  </Button>
                  <p className="text-sm text-slate-400 font-medium">
                    Step 1: Create Profile → Step 2: View Treatment Outcomes
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Secondary CTA: Find Centers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-2xl mt-12"
          >
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="bg-teal-50 p-3 rounded-lg">
                   <MapPin className="h-6 w-6 text-[#00BFB3]" />
                 </div>
                 <div className="text-left">
                   <h3 className="font-bold text-slate-900">Then Find Treatment Centers Near You</h3>
                   <p className="text-sm text-slate-500">After comparing treatment plans, explore hospitals by location, rating, and cost.</p>
                 </div>
              </div>
              <Button 
                variant="outline" 
                className="border-[#00BFB3] text-[#00BFB3] hover:bg-teal-50 font-semibold whitespace-nowrap"
                onClick={() => navigate('/find-centers')}
              >
                Browse Centers
              </Button>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.5 }}
             className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-500 font-medium"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-[#E91E63]" />
              <span>CMS Data Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[#E91E63]" />
              <span>PubMed Clinical Trials</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[#E91E63]" />
              <span>Personalized Simulations</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How PinkRibbon Works</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">We combine clinical trial data with real-world outcomes to help you make the safest choice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center text-center group">
              <div className="h-24 w-24 bg-white border-4 border-pink-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#E91E63] transition-colors">
                <Activity className="h-10 w-10 text-[#E91E63]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">1. Simulate Treatments</h3>
              <p className="text-slate-500 leading-relaxed">Input your profile to run Monte Carlo simulations for 5 different treatment plans.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
               <div className="h-24 w-24 bg-white border-4 border-teal-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#00BFB3] transition-colors">
                <MapPin className="h-10 w-10 text-[#00BFB3]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">2. Find Best Centers</h3>
              <p className="text-slate-500 leading-relaxed">Locate hospitals near you with the highest ratings and best cost-effectiveness.</p>
            </div>

            <div className="flex flex-col items-center text-center group">
               <div className="h-24 w-24 bg-white border-4 border-purple-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#C09BB9] transition-colors">
                <BarChart2 className="h-10 w-10 text-[#C09BB9]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">3. Compare & Decide</h3>
              <p className="text-slate-500 leading-relaxed">Side-by-side comparison of logistics, costs, and ratings to make your final choice.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
