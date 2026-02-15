import { Star, Check, ArrowDown, ArrowUp, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Hospital } from '../data/mockData';
import { cn } from '../lib/utils';

interface HospitalCardProps {
  hospital: Hospital;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  isMapHovered?: boolean;
}

export function HospitalCard({ hospital, onSelect, isSelected, onHover, isMapHovered }: HospitalCardProps) {
  // Helper for MSPB
  const getMSPBDisplay = (val: number) => {
    if (val < 0.95) return { color: 'text-green-600', bg: 'bg-green-50', icon: <ArrowDown className="h-3 w-3" />, text: 'Lower cost' };
    if (val > 1.05) return { color: 'text-red-600', bg: 'bg-red-50', icon: <ArrowUp className="h-3 w-3" />, text: 'Higher cost' };
    return { color: 'text-amber-600', bg: 'bg-amber-50', icon: <ArrowRight className="h-3 w-3" />, text: 'Average cost' };
  };

  const mspb = getMSPBDisplay(hospital.metrics.mspbComparison);

  return (
    <Card 
      className={cn(
        "mb-4 transition-all duration-200 border-l-4 hover:shadow-md cursor-pointer group relative overflow-hidden",
        isSelected ? "border-l-[#E91E63] ring-1 ring-[#E91E63] bg-pink-50/10" : "border-l-transparent hover:border-l-slate-300",
        isMapHovered ? "ring-2 ring-[#E91E63]" : ""
      )}
      onMouseEnter={() => onHover(hospital.id)}
      onMouseLeave={() => onHover(null)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{hospital.name}</h3>
          </div>
          
          <div className="flex flex-col items-end">
             {/* Compare Checkbox */}
             <div 
               onClick={(e) => { e.stopPropagation(); onSelect(hospital.id); }} 
               className={cn(
                 "cursor-pointer rounded-md border p-1 transition-all",
                 isSelected ? "bg-[#E91E63] border-[#E91E63] text-white" : "bg-white border-slate-300 text-slate-300 hover:border-[#E91E63] hover:text-[#E91E63]"
               )}
             >
               {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
             </div>
             <span className="text-[10px] text-slate-400 mt-1">{isSelected ? 'Added' : 'Compare'}</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 mb-3 bg-slate-50/50 -mx-4 px-4">
          
          {/* Col 1: Overall Rating */}
          <div className="flex flex-col">
            <div className="text-[10px] text-slate-500 font-medium mb-1">Overall Rating</div>
            <div className="flex items-center gap-1">
               {hospital.metrics.overallRating > 0 ? (
                 <>
                   <div className="flex text-yellow-400">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <Star
                         key={star}
                         className={cn("h-3 w-3", star <= Math.round(hospital.metrics.overallRating) ? "fill-current" : "text-slate-200")}
                       />
                     ))}
                   </div>
                   <span className="text-xs font-bold text-slate-700">{hospital.metrics.overallRating}</span>
                 </>
               ) : (
                 <span className="text-xs text-slate-400">Not Rated</span>
               )}
            </div>
          </div>

          {/* Col 2: Cost Effectiveness */}
          <div className="flex flex-col border-l border-slate-200 pl-3">
             <div className="text-[10px] text-slate-500 font-medium mb-1">Cost Efficiency</div>
             <div className={`flex items-center gap-1 text-xs font-bold ${mspb.color}`}>
                {mspb.icon}
                <span className="whitespace-nowrap">{mspb.text}</span>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end">
           <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 px-2" asChild>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}`)}`} target="_blank" rel="noreferrer">
                 Directions
              </a>
           </Button>
        </div>

      </CardContent>
    </Card>
  );
}
