
import React, { useState, useMemo } from 'react';
import { Filter, Map as MapIcon, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { HOSPITALS } from '../data/mockData';
import { HospitalCard } from '../components/HospitalCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/Accordion'; // Need to create Accordion
import { Badge } from '../components/ui/Badge';

// Simple Map Component
const MapView = ({ hospitals, hoveredId, selectedIds, onSelect, onHover }: any) => {
  // Calculate bounds
  const lats = hospitals.map((h: any) => h.coordinates.lat);
  const lngs = hospitals.map((h: any) => h.coordinates.lng);
  const minLat = Math.min(...lats) - 0.05;
  const maxLat = Math.max(...lats) + 0.05;
  const minLng = Math.min(...lngs) - 0.05;
  const maxLng = Math.max(...lngs) + 0.05;

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Pins */}
      {hospitals.map((hospital: any) => {
        const latPercent = (hospital.coordinates.lat - minLat) / (maxLat - minLat) * 100;
        const lngPercent = (hospital.coordinates.lng - minLng) / (maxLng - minLng) * 100;
        
        const isSelected = selectedIds.includes(hospital.id);
        const isHovered = hoveredId === hospital.id;

        return (
          <div
            key={hospital.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10"
            style={{ bottom: `${latPercent}%`, left: `${lngPercent}%` }}
            onMouseEnter={() => onHover(hospital.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(hospital.id)}
          >
            <div className={cn(
              "flex flex-col items-center",
              isHovered || isSelected ? "scale-110 z-50" : "scale-100"
            )}>
               <div className={cn(
                 "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors",
                 isSelected ? "bg-[#00BFB3] border-white text-white" : 
                 isHovered ? "bg-[#00BFB3] border-white text-white" : "bg-white border-[#00BFB3] text-[#00BFB3]"
               )}>
                 <span className="font-bold text-xs">{hospital.rating}</span>
               </div>
               <div className="w-0.5 h-3 bg-slate-400"></div>
               <div className="w-2 h-1 bg-slate-300 rounded-full opacity-50 blur-[1px]"></div>
               
               {(isHovered || isSelected) && (
                 <div className="absolute bottom-12 bg-white p-2 rounded shadow-xl border w-40 text-center z-50 pointer-events-none">
                    <div className="font-bold text-sm text-slate-800">{hospital.name}</div>
                    <div className="text-xs text-green-600 font-medium">{hospital.metrics.independence90Day}% Success</div>
                 </div>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function MapSearchPage() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3) // Max 3
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel: Sidebar */}
      <div className="w-full md:w-[35%] flex flex-col border-r bg-white shadow-xl z-20">
        
        {/* Header/Filters */}
        <div className="p-4 border-b bg-white">
           <div className="flex items-center justify-between mb-4">
             <h2 className="font-bold text-lg text-slate-800">Results</h2>
             <Button variant="ghost" size="sm" className="text-[#00BFB3]">
               <Filter className="h-4 w-4 mr-1" /> Filters
             </Button>
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                In-Network Only
              </Badge>
               <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                Distance: &lt; 50mi
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                Rating: 4.0+
              </Badge>
           </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
           <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
             <span>{HOSPITALS.length} providers found</span>
             <span>Sorted by: <strong>Relevance</strong></span>
           </div>

           {HOSPITALS.map(hospital => (
             <HospitalCard 
               key={hospital.id} 
               hospital={hospital} 
               isSelected={selectedIds.includes(hospital.id)}
               onSelect={handleSelect}
               onHover={setHoveredId}
               isMapHovered={hoveredId === hospital.id}
             />
           ))}
        </div>

        {/* Compare Tray (Sticky Bottom) */}
        {selectedIds.length > 0 && (
          <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-700">{selectedIds.length} Selected to Compare</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-slate-500" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
            </div>
            <div className="flex gap-2 mb-3">
              {selectedIds.map(id => {
                 const h = HOSPITALS.find(h => h.id === id);
                 return (
                   <div key={id} className="bg-slate-100 rounded px-2 py-1 text-xs flex items-center gap-1 max-w-[100px] truncate">
                     <span className="truncate">{h?.name}</span>
                     <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleSelect(id)} />
                   </div>
                 );
              })}
            </div>
            <Button 
              className="w-full bg-[#00BFB3] hover:bg-[#00A69C] text-white" 
              onClick={() => navigate('/compare')}
              disabled={selectedIds.length < 2}
            >
              Compare These Centers <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel: Map */}
      <div className="hidden md:block w-[65%] h-full relative">
        <MapView 
          hospitals={HOSPITALS} 
          hoveredId={hoveredId} 
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onHover={setHoveredId}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
           <Button variant="secondary" size="icon" className="bg-white shadow-md rounded-lg">
             <MapIcon className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </div>
  );
}
