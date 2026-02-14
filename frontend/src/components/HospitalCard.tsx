
import React from 'react';
import { MapPin, Star, Bed, Clock, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Hospital } from '../data/mockData';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface HospitalCardProps {
  hospital: Hospital;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  isMapHovered?: boolean;
}

export function HospitalCard({ hospital, onSelect, isSelected, onHover, isMapHovered }: HospitalCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className={cn(
        "mb-4 transition-all duration-200 border-l-4 hover:shadow-md cursor-pointer",
        isSelected ? "border-l-[#00BFB3] bg-teal-50/30" : "border-l-transparent",
        isMapHovered ? "ring-2 ring-[#00BFB3]" : ""
      )}
      onMouseEnter={() => onHover(hospital.id)}
      onMouseLeave={() => onHover(null)}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{hospital.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={hospital.type === 'Comprehensive Stroke Center' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
                {hospital.type}
              </Badge>
              <span className="text-xs text-slate-500 flex items-center">
                <MapPin className="h-3 w-3 mr-0.5" /> {hospital.distance} mi
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div onClick={(e) => { e.stopPropagation(); onSelect(hospital.id); }} className="cursor-pointer p-1">
               {isSelected ? <CheckSquare className="h-5 w-5 text-[#00BFB3]" /> : <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />}
             </div>
             {hospital.rating && (
               <div className="flex items-center text-xs font-medium text-yellow-500 mt-1">
                 <Star className="h-3 w-3 fill-current mr-1" /> {hospital.rating}
               </div>
             )}
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 my-3">
          <div className="text-center border-r border-slate-100">
            <div className="text-sm font-bold text-green-600">{hospital.metrics.independence90Day}%</div>
            <div className="text-[10px] text-slate-400">90-Day Independence</div>
          </div>
          <div className="text-center border-r border-slate-100">
            <div className="text-sm font-bold text-slate-600">{hospital.metrics.mortality30Day}%</div>
            <div className="text-[10px] text-slate-400">Mortality Rate</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900">${hospital.metrics.estOutOfPocket}</div>
            <div className="text-[10px] text-slate-400">Est. Cost</div>
          </div>
        </div>
        
        {/* CMS Data Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded">
           <span className="flex items-center gap-1">
             <ShieldCheck className="h-3 w-3 text-[#00BFB3]" />
             CMS Treatment Rate: <strong className="text-slate-700">{hospital.metrics.cmsTreatmentRate}%</strong>
           </span>
           <span className="text-[10px] italic">Verified</span>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
           <div className="flex gap-3">
             <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {hospital.metrics.doorToNeedle} min</span>
             <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {hospital.metrics.beds} beds</span>
           </div>
           <span className={hospital.isInNetwork ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
             {hospital.isInNetwork ? "In Network" : "Out of Network"}
           </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => {}}>View on Map</Button>
           <Button 
            className="flex-1 text-xs h-8 bg-[#00BFB3] hover:bg-[#00A69C]" 
            size="sm"
            onClick={() => navigate(`/simulation/${hospital.id}`)}
           >
             Simulate Outcomes
           </Button>
        </div>

      </CardContent>
    </Card>
  );
}
