
import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-2">CareCompass</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-4">
            Compare Healthcare Outcomes Before You Choose.
            See probability distributions, cost estimates, and real-world success rates.
          </p>
          <div className="text-xs text-slate-400">
            Educational simulator — not medical advice. Consult licensed physician.
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="/map" className="hover:text-primary">Find Centers</Link></li>
            <li><Link to="/profile" className="hover:text-primary">My Health Profile</Link></li>
            <li><Link to="/compare" className="hover:text-primary">Comparisons</Link></li>
            <li><Link to="/simulation" className="hover:text-primary">Simulations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">About</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link to="#" className="hover:text-primary">About Us</Link></li>
            <li><Link to="#" className="hover:text-primary">Data Sources (CMS)</Link></li>
            <li><Link to="#" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-primary">Methodology</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2024 CareCompass Inc. HIPAA Compliant.
      </div>
    </footer>
  );
}
