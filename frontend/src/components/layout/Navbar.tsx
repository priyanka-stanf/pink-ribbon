import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, Compass } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Simulate', path: '/profile' },
    { name: 'Find Centers', path: '/find-centers' },
    { name: 'About', path: '/about' },
    { name: 'Methodology', path: '/methodology' },
    { name: 'Data Sources', path: '/data-sources' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4 mx-auto justify-between">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          {/* Compass Icon + Pink Ribbon concept */}
          <div className="relative flex items-center justify-center w-8 h-8 bg-teal-50 rounded-full">
            <Compass className="h-6 w-6 text-[#00BFB3]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E91E63] rounded-full ring-2 ring-white"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">
            <span className="text-[#E91E63]">Pink</span>
            <span className="text-[#00BFB3]">Ribbon</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Button 
              key={link.path} 
              variant={location.pathname === link.path ? "secondary" : "ghost"} 
              size="sm" 
              asChild
              className={location.pathname === link.path ? "text-[#E91E63] bg-pink-50 hover:bg-pink-100" : ""}
            >
              <Link to={link.path}>{link.name}</Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <div className="hidden sm:flex items-center">
             <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                </Link>
             </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-white space-y-2 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => (
            <Button 
              key={link.path} 
              variant="ghost" 
              className="w-full justify-start" 
              asChild
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to={link.path}>{link.name}</Link>
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
}
