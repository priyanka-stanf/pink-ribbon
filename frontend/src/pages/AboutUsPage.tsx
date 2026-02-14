import React from 'react';
import { Activity, Users, Target, Shield, Heart, TrendingUp, Mail } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AboutUsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#E0F2F1] py-20 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Making Healthcare Decisions Transparent, <br className="hidden sm:inline" />
            <span className="text-[#00BFB3]">One Simulation at a Time</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            CareCompass was born at TreeHacks 2025 from a simple question: Why do patients make 
            life-or-death healthcare decisions with less data than they use to buy a coffee maker?
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Story</h2>
          
          <div className="space-y-12">
            {/* The Problem */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                The Problem We're Solving
              </h3>
              <div className="text-slate-700 space-y-4 ml-14">
                <p>
                  Every year, millions of patients face critical healthcare decisions with incomplete information. 
                  You might research hospitals, read reviews, or ask friends—but you're still missing the most 
                  important piece: <strong>How do your personal health factors, combined with a specific facility's 
                  real-world performance, actually affect YOUR outcome?</strong>
                </p>
                <p>
                  Traditional healthcare resources show you either generic success rates or hospital star ratings. 
                  But healthcare isn't one-size-fits-all. The same breast cancer patient going to two different 
                  hospitals 10 miles apart can have vastly different outcomes—and current tools don't help you see that.
                </p>
              </div>
            </div>

            {/* Our Solution */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Activity className="h-6 w-6 text-[#00BFB3]" />
                </div>
                Our Solution
              </h3>
              <div className="text-slate-700 space-y-4 ml-14">
                <p>
                  CareCompass uses <strong>Monte Carlo simulation</strong>—the same probabilistic modeling 
                  technique used by NASA, Wall Street, and weather forecasters—to show you personalized 
                  outcome distributions. We combine:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your individual health profile (age, stage, medical history)</li>
                  <li>Real-world hospital performance data from CMS</li>
                  <li>Clinical trial evidence</li>
                  <li>Geographic access constraints</li>
                  <li>Insurance and cost factors</li>
                </ul>
                <p>
                  The result? You see not just a single success rate, but a full probability distribution 
                  of possible outcomes, and more importantly, <strong>what factors you can actually control 
                  to improve your odds</strong>.
                </p>
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-[#E0F2F1] p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-[#00BFB3]" />
                Why This Matters
              </h3>
              <p className="text-slate-700">
                We believe patients deserve to see the <strong>variance</strong> in healthcare. Two patients 
                with identical diagnoses can have wildly different outcomes based on which facility they choose, 
                how quickly they arrive, and whether that facility actually follows evidence-based guidelines 
                in practice.
              </p>
              <p className="text-slate-700 mt-4">
                Our platform makes that variance visible—and actionable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Mission & Values</h2>
          
          {/* Mission */}
          <Card className="mb-8 border-[#00BFB3] border-2">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <Heart className="h-7 w-7 text-[#00BFB3]" />
                Our Mission
              </h3>
              <p className="text-lg text-slate-700">
                Empower patients with probabilistic clarity so they can make informed healthcare decisions 
                based on real-world data, not just institutional reputation.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#00BFB3]" />
                  Transparency First
                </h4>
                <p className="text-slate-700 text-sm">
                  We show you our methodology, our data sources, and our uncertainty. No black boxes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#00BFB3]" />
                  Evidence-Based
                </h4>
                <p className="text-slate-700 text-sm">
                  Every probability we show is grounded in peer-reviewed research, CMS data, and clinical trials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#00BFB3]" />
                  Patient-Centered
                </h4>
                <p className="text-slate-700 text-sm">
                  Healthcare is complex. Our interface isn't. We translate statistical models into clear, 
                  actionable insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#00BFB3]" />
                  Privacy-Protected
                </h4>
                <p className="text-slate-700 text-sm">
                  Your health data never leaves your device. We don't store, sell, or share personal 
                  health information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">The Team</h2>
          
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-[#00BFB3]">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">TreeHacks 2025 Project</h3>
              <p className="text-slate-700 mb-4">
                Built at Stanford's premier hackathon, combining expertise in computer science, 
                healthcare policy, and data science.
              </p>
              <p className="text-sm text-slate-600 italic">
                This project draws on research from health economics, clinical medicine, and probabilistic 
                modeling communities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What's Next */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">What's Next</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Current Status</h3>
              <p className="text-slate-700">MVP focused on breast cancer treatment pathways</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Coming Soon</h3>
              <ul className="text-slate-700 space-y-1">
                <li>• Cardiac care outcomes modeling</li>
                <li>• STEMI (heart attack) decisions</li>
                <li>• Additional cancer pathways</li>
                <li>• International data integration</li>
                <li>• Real-time clinical trial matching</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Get Involved</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-slate-900 mb-2">For Healthcare Providers</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Interested in partnering to improve data quality or validate our models?
                </p>
                <Button variant="outline" size="sm" className="border-[#00BFB3] text-[#00BFB3]">
                  Contact Us
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-slate-900 mb-2">For Researchers</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Our methodology is open-source. We welcome collaboration and peer review.
                </p>
                <Button variant="outline" size="sm" className="border-[#00BFB3] text-[#00BFB3]">
                  View on GitHub
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <h4 className="font-bold text-slate-900 mb-2">For Patients</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Have feedback on how we can make this tool more useful? We're listening.
                </p>
                <Button variant="outline" size="sm" className="border-[#00BFB3] text-[#00BFB3]">
                  Send Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-[#00BFB3]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Questions or Want to Learn More?</h3>
          <p className="text-teal-50 mb-6 max-w-2xl mx-auto">
            We're always happy to discuss our methodology, data sources, or potential collaborations.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-[#00BFB3] hover:bg-slate-100">
            <Mail className="h-5 w-5 mr-2" />
            hello@carecompass.health
          </Button>
        </div>
      </section>
    </div>
  );
}
