import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, User, Search, MapPin, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const location = useLocation();
  const isMapPage = location.pathname.includes('/map');
  const isProfilePage = location.pathname.includes('/profile');
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Activity className="h-6 w-6 text-[#00BFB3]" />
          <span className="hidden font-bold sm:inline-block text-[#1F2937] text-xl">
            CareCompass
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 flex-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/map">Find Centers</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/about">About</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/data-sources">Data Sources</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/methodology">Methodology</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/privacy">Privacy</Link>
          </Button>
        </div>
        
        {isMapPage && (
          <div className="hidden lg:flex items-center space-x-2 rounded-full border bg-slate-50 px-4 py-1.5 text-sm hover:bg-slate-100 cursor-pointer transition-colors mx-4">
            <span className="font-medium text-slate-900">Breast Cancer</span>
            <span className="text-slate-400 mx-1">•</span>
            <span className="text-slate-600">94305</span>
            <span className="text-slate-400 mx-1">•</span>
            <span className="text-slate-600">50 miles</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2">
          {isMapPage && (
             <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
               <Link to="/compare">
                 Compare (2)
               </Link>
             </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}