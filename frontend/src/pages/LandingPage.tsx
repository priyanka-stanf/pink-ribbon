import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ShieldCheck, Activity, BarChart2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#E0F2F1] pb-24 pt-16 lg:pt-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00BFB3_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl max-w-4xl mx-auto">
              Compare Healthcare Outcomes <br className="hidden sm:inline" />
              <span className="text-[#00BFB3]">Before You Choose</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto">
              See probability distributions, cost estimates, and real-world success rates using CMS data and Monte Carlo simulations.
            </p>
          </motion.div>

          {/* Profile Creation CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-4xl mt-8"
          >
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-[#00BFB3] shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-white rounded-full">
                      <User className="h-8 w-8 text-[#00BFB3]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Create Your Health Profile</h3>
                      <p className="text-sm text-slate-600 mt-1">Get personalized outcome predictions based on your medical data</p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-[#00BFB3] hover:bg-[#00A69C] text-white font-semibold px-8 shadow-md"
                    onClick={() => navigate('/profile')}
                  >
                    Create Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-4xl mt-10"
          >
            <Card className="shadow-xl border-slate-200">
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* Diagnosis Input */}
                  <div className="md:col-span-5 text-left space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Diagnosis or Procedure</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="e.g., Breast Cancer, Stroke" 
                        className="pl-9 h-12 text-lg"
                      />
                    </div>
                  </div>

                  {/* Zip Code */}
                  <div className="md:col-span-3 text-left space-y-2">
                     <label className="text-sm font-medium text-slate-700 ml-1">Zip Code</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="94305" 
                        className="pl-9 h-12 text-lg"
                      />
                    </div>
                  </div>

                  {/* Insurance */}
                   <div className="md:col-span-4 text-left space-y-2">
                     <label className="text-sm font-medium text-slate-700 ml-1">Insurance</label>
                    <select className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">Select Insurance Type</option>
                      <option value="medicare">Medicare</option>
                      <option value="medicaid">Medicaid</option>
                      <option value="ppo">PPO</option>
                      <option value="hmo">HMO</option>
                      <option value="uninsured">Uninsured</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                   <div className="w-full md:w-1/2 flex items-center space-x-4 px-1">
                      <span className="text-sm text-slate-500 whitespace-nowrap">Travel Radius:</span>
                      <div className="flex-1">
                         <input type="range" min="0" max="200" defaultValue="50" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00BFB3]" />
                         <div className="flex justify-between text-xs text-slate-400 mt-1">
                           <span>0 mi</span>
                           <span>50 mi</span>
                           <span>200 mi</span>
                         </div>
                      </div>
                   </div>
                   
                   <Button 
                    size="lg" 
                    className="w-full md:w-auto bg-[#00BFB3] hover:bg-[#00A69C] text-white font-semibold px-8 h-12 text-lg shadow-lg shadow-teal-500/20"
                    onClick={() => navigate('/map')}
                   >
                     Find Centers & Compare
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-slate-500 font-medium"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-[#00BFB3]" />
              <span>CMS Data Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[#00BFB3]" />
              <span>Real-World Success Rates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">5k</div>
              <span>5,000+ Hospitals</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How CareCompass Works</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">We combine clinical trial data with real-world outcomes to help you make the safest choice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-6">
                <Activity className="h-8 w-8 text-[#00BFB3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Enter Your Diagnosis</h3>
              <p className="text-slate-500">Search by condition, procedure, or symptoms to see relevant treatment centers near you.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
               <div className="h-16 w-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-[#00BFB3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Compare Centers</h3>
              <p className="text-slate-500">See side-by-side comparisons of mortality rates, readmission risks, and costs.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
               <div className="h-16 w-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-6">
                <BarChart2 className="h-8 w-8 text-[#00BFB3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. See Outcome Probabilities</h3>
              <p className="text-slate-500">Run Monte Carlo simulations customized to your personal health profile.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}