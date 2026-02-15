import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center space-x-2 mb-4">
             <div className="relative flex items-center justify-center w-6 h-6 bg-teal-50 rounded-full">
               <Compass className="h-4 w-4 text-[#00BFB3]" />
               <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#E91E63] rounded-full ring-1 ring-white"></div>
             </div>
             <span className="font-bold text-lg tracking-tight">
               <span className="text-[#E91E63]">Pink</span>
               <span className="text-[#00BFB3]">Ribbon</span>
             </span>
          </Link>
          <p className="text-slate-500 text-sm max-w-sm mb-4">
            See How Breast Cancer Treatment Plans Affect Your Long-Term Outcomes.
            Compare probability distributions, cost estimates, and real-world success rates.
          </p>
          <div className="text-xs text-slate-400 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <strong>Disclaimer:</strong> This is an educational simulator based on probabilistic models and historical CMS data. 
            It is not medical advice. Always consult your licensed physician for treatment decisions.
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="/simulate" className="hover:text-[#E91E63] transition-colors">Simulate Treatments</Link></li>
            <li><Link to="/find-centers" className="hover:text-[#00BFB3] transition-colors">Find Centers</Link></li>
            <li><Link to="/profile" className="hover:text-[#00BFB3] transition-colors">My Health Profile</Link></li>
            <li><Link to="/compare" className="hover:text-[#00BFB3] transition-colors">Comparisons</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">About</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="/about" className="hover:text-[#00BFB3] transition-colors">About Us</Link></li>
            <li><Link to="/data-sources" className="hover:text-[#00BFB3] transition-colors">Data Sources (CMS)</Link></li>
            <li><Link to="/methodology" className="hover:text-[#00BFB3] transition-colors">Methodology</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 flex flex-col md:flex-row justify-between items-center gap-2">
        <span>© 2026 PinkRibbon Inc. · Created for TreeHacks 2026</span>
        <span className="flex items-center gap-2 mt-2 md:mt-0">
           <span className="w-2 h-2 bg-green-500 rounded-full"></span> HIPAA Compliant (Local Storage Only)
        </span>
      </div>
    </footer>
  );
}
