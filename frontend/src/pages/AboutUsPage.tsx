import React from 'react';
import { Activity, Users, Shield, Heart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AboutUsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#E0F2F1] py-20 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Breast Cancer Treatment Decisions, <span className="text-[#00BFB3]">Powered by Monte Carlo Simulations</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            PinkRibbon was born at TreeHacks 2026 from a simple question: Why do breast cancer patients have such little clarity surrounding their treatment paths?
          </p>
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
                Empower patients with probabilistic outcomes so they can understand their treatment paths using real-world data and compare hospitals in their area.
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

      {/* TreeHacks Project */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-[#00BFB3]">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">TreeHacks 2026 Project</h3>
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

      {/* Created By */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Created By</h2>

          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-[#00BFB3]">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-slate-900">
                <div>
                  <p className="font-semibold text-lg">Grace Housman</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Rudy Pathak</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Shardul Marathe</p>
                </div>
                <div>
                  <p className="font-semibold text-lg">Priyanka Kudallur</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
