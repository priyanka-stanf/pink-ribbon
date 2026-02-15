import { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { Map as MapIcon, X, ArrowRight, Search, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { HOSPITALS, Hospital } from '../data/mockData';
import { HospitalCard } from '../components/HospitalCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHWAY_NAMES, PATHWAY_TO_TREATMENT_ID, calculateBestTreatment, ProjectionResult, searchHospitals } from '../lib/api';

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = lazy(() => import('../components/LeafletMap').then(m => ({ default: m.LeafletMap })));

const SIMULATION_STORAGE_KEY = 'pinkribbon_simulation_results';

// Get user's ZIP code from profile
const getUserZip = (): string => {
  try {
    const saved = localStorage.getItem('pinkribbon_profile');
    if (saved) {
      const profile = JSON.parse(saved);
      return profile.zip_code || '';
    }
  } catch (err) {
    console.error('Error reading profile:', err);
  }
  return '';
};

export function MapSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userZip, setUserZip] = useState('');
  const [useRealData, setUseRealData] = useState(false);

  // Fetch hospitals from backend on mount
  useEffect(() => {
    const zip = getUserZip();
    setUserZip(zip);

    if (!zip) {
      // No ZIP code, use mock data
      setHospitals(HOSPITALS);
      setLoading(false);
      setUseRealData(false);
      return;
    }

    setLoading(true);
    searchHospitals(zip)
      .then(data => {
        if (data.hospitals && data.hospitals.length > 0) {
          // Always use real backend data for the list
          setHospitals(data.hospitals);
          setUseRealData(true);

          // Check if hospitals have coordinates for the map
          const hasCoords = data.hospitals.some(h => h.coordinates.lat !== 0 || h.coordinates.lng !== 0);
          if (!hasCoords) {
            setError(`Found ${data.count} hospitals near ${zip}. Map visualization pending geocoding.`);
          }
        } else {
          // No hospitals found, use sample data
          setHospitals(HOSPITALS);
          setUseRealData(false);
          setError('No hospitals found for this ZIP code. Showing sample data.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Hospital search error:', err);
        setError('Backend unavailable. Showing sample data.');
        setHospitals(HOSPITALS);
        setUseRealData(false);
        setLoading(false);
      });
  }, []);

  // Get the best pathway - try from navigation state first, then calculate from localStorage
  const getBestPathway = (): string | null => {
    // First check if passed directly via navigation state
    const statePathway = location.state?.bestPathway as string | undefined;
    if (statePathway) return statePathway;

    // Otherwise, load simulation results from localStorage and calculate
    try {
      const stored = localStorage.getItem(SIMULATION_STORAGE_KEY);
      if (stored) {
        const results = JSON.parse(stored) as ProjectionResult;
        return calculateBestTreatment(results.pathways);
      }
    } catch (err) {
      console.error('Error loading simulation results from localStorage:', err);
    }
    return null;
  };

  const bestPathway = getBestPathway();
  const recommendedTreatmentId = bestPathway ? PATHWAY_TO_TREATMENT_ID[bestPathway] : null;
  const recommendedTreatmentName = bestPathway ? PATHWAY_NAMES[bestPathway] : null;

  // Sort hospitals: prioritize those offering the recommended treatment, then by rating
  const sortedHospitals = useMemo(() => {
    if (!recommendedTreatmentId) {
      return [...hospitals].sort((a, b) => b.metrics.overallRating - a.metrics.overallRating);
    }

    return [...hospitals].sort((a, b) => {
      const aOffers = a.offersTreatments.includes(recommendedTreatmentId);
      const bOffers = b.offersTreatments.includes(recommendedTreatmentId);

      // Sort by: offers treatment first, then by rating
      if (aOffers && !bOffers) return -1;
      if (!aOffers && bOffers) return 1;
      return b.metrics.overallRating - a.metrics.overallRating;
    });
  }, [recommendedTreatmentId, hospitals]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3) // Max 3 to compare
    );
  };

  const hasMapCoordinates = hospitals.some(h => h.coordinates.lat !== 0 || h.coordinates.lng !== 0);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">

      {/* Top Search Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-30">
        <div className="flex items-center gap-4 text-sm">
          <div className="font-bold text-slate-900 flex items-center gap-2">
             <span className="bg-slate-100 p-1.5 rounded-md"><Search className="h-4 w-4 text-slate-500" /></span>
             Breast Cancer Treatment Centers
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {userZip || '94305'} • {useRealData ? 'Real data' : 'Sample data'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
           {bestPathway ? (
             <>
               <Badge variant="outline" className="text-slate-500 border-slate-200">
                 Recommended: {recommendedTreatmentName}
               </Badge>
               <Button variant="link" className="text-[#00BFB3] text-xs px-0 h-auto" onClick={() => navigate('/simulate')}>
                 View Results
               </Button>
             </>
           ) : (
             <Badge variant="outline" className="text-slate-500 border-slate-200">
               All Treatment Plans
             </Badge>
           )}
        </div>
      </div>

      {/* Info Banner */}
      {error && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center gap-2 text-sm text-blue-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Sidebar */}
        <div className="w-full md:w-[400px] flex flex-col border-r bg-white shadow-xl z-20 relative">

          {/* Sticky Compare Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-[#E91E63]/10 border-b border-[#E91E63]/20 p-3 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[#E91E63]">{selectedIds.length} Selected to Compare</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-500 hover:text-red-500" onClick={() => setSelectedIds([])}>
                  Clear All
                </Button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedIds.map(id => {
                   const h = hospitals.find(h => h.id === id);
                   return (
                     <div key={id} className="bg-white border border-[#E91E63]/30 rounded-md px-2 py-1 text-xs flex items-center gap-1 shadow-sm min-w-[100px] justify-between">
                       <span className="truncate max-w-[80px] font-medium text-slate-700">{h?.name}</span>
                       <X className="h-3 w-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => handleSelect(id)} />
                     </div>
                   );
                })}
              </div>
              <Button
                className="w-full bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold shadow-md shadow-pink-500/20 mt-2"
                size="sm"
                onClick={() => navigate('/compare', { state: { selectedIds, hospitals: hospitals.filter(h => selectedIds.includes(h.id)) } })}
                disabled={selectedIds.length < 2}
              >
                Compare These Centers <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
             {loading ? (
               <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                 <Loader2 className="h-8 w-8 animate-spin mb-3 text-[#00BFB3]" />
                 <p className="text-sm">Loading hospitals{userZip ? ` near ${userZip}` : ''}...</p>
               </div>
             ) : (
               <>
                 <div className="text-xs text-slate-500 mb-2">
                   <span>{sortedHospitals.length} providers found</span>
                 </div>

                 {sortedHospitals.map(hospital => {
                   const offersRecommended = recommendedTreatmentId ? hospital.offersTreatments.includes(recommendedTreatmentId) : false;
                   return (
                     <div key={hospital.id} className="relative">
                       {offersRecommended && bestPathway && (
                         <div className="absolute -top-2 -left-2 z-10">
                           <Badge className="bg-[#E91E63] text-white text-xs shadow-md">Offers Recommended</Badge>
                         </div>
                       )}
                       <HospitalCard
                         hospital={hospital}
                         isSelected={selectedIds.includes(hospital.id)}
                         onSelect={handleSelect}
                         onHover={setHoveredId}
                         isMapHovered={hoveredId === hospital.id}
                       />
                     </div>
                   );
                 })}
               </>
             )}

             {/* End of list spacer */}
             <div className="h-10"></div>
          </div>
        </div>

        {/* Right Panel: Leaflet Map */}
        <div className="hidden md:block flex-1 h-full relative">
          {sortedHospitals.length > 0 && hasMapCoordinates ? (
            <Suspense fallback={
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00BFB3]" />
              </div>
            }>
              <LeafletMap
                hospitals={sortedHospitals}
                hoveredId={hoveredId}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onHover={setHoveredId}
              />
            </Suspense>
          ) : loading ? (
            <div className="flex items-center justify-center h-full bg-slate-50">
              <Loader2 className="h-8 w-8 animate-spin text-[#00BFB3]" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50">
              <div className="text-center text-slate-400 max-w-md p-6">
                <MapIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium mb-2">No hospitals to display</p>
                <p className="text-xs">{error || 'Create a profile with a ZIP code to find nearby hospitals.'}</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
             <Button variant="secondary" size="icon" className="bg-white shadow-md rounded-lg hover:bg-slate-50">
               <MapIcon className="h-5 w-5 text-slate-600" />
             </Button>
             <Button variant="secondary" size="icon" className="bg-white shadow-md rounded-lg hover:bg-slate-50">
               <SlidersHorizontal className="h-5 w-5 text-slate-600" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
