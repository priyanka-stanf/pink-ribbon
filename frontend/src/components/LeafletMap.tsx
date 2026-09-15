import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../data/mockData';

interface LeafletMapProps {
  hospitals: Hospital[];
  hoveredId: string | null;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function LeafletMap({ hospitals, hoveredId, selectedIds, onSelect, onHover }: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hospitals the backend could not geocode come back as (0, 0). They must be excluded
  // from both the markers and the centre: averaging a (0, 0) in drags the centre into the
  // Atlantic and pushes the real markers off-screen.
  const located = hospitals.filter(
    (h) => h.coordinates.lat !== 0 || h.coordinates.lng !== 0
  );

  if (!mounted || located.length === 0) {
    return <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>;
  }

  // Calculate center from the located hospitals only
  const avgLat = located.reduce((sum, h) => sum + h.coordinates.lat, 0) / located.length;
  const avgLng = located.reduce((sum, h) => sum + h.coordinates.lng, 0) / located.length;

  const createCustomIcon = (hospital: Hospital) => {
    const isSelected = selectedIds.includes(hospital.id);
    const isHovered = hoveredId === hospital.id;

    let ratingColor = "bg-slate-400";
    if (hospital.metrics.overallRating >= 4.5) ratingColor = "bg-green-500";
    else if (hospital.metrics.overallRating >= 3.5) ratingColor = "bg-yellow-500";
    else if (hospital.metrics.overallRating >= 3.0) ratingColor = "bg-orange-500";
    else ratingColor = "bg-red-500";

    const iconHtml = `
      <div style="
        transform: scale(${isHovered || isSelected ? '1.1' : '1'});
        transition: transform 0.3s;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: ${isSelected ? '#E91E63' : 'white'};
          border: 2px solid ${isSelected ? 'white' : isHovered ? '#E91E63' : '#e2e8f0'};
          border-radius: 6px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          ${isSelected ? 'box-shadow: 0 0 0 2px rgba(233, 30, 99, 0.3);' : ''}
        ">
          <span style="
            font-weight: bold;
            font-size: 12px;
            color: ${isSelected ? 'white' : '#1e293b'};
          ">${hospital.metrics.overallRating > 0 ? hospital.metrics.overallRating : '-'}</span>
          <span style="color: ${isSelected ? 'white' : '#fbbf24'}; font-size: 12px;">★</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-hospital-marker',
      iconSize: [60, 30],
      iconAnchor: [30, 30],
    });
  };

  return (
    <MapContainer
      center={[avgLat, avgLng]}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {located.map((hospital) => (
        <Marker
          key={hospital.id}
          position={[hospital.coordinates.lat, hospital.coordinates.lng]}
          icon={createCustomIcon(hospital)}
          eventHandlers={{
            click: () => onSelect(hospital.id),
            mouseover: () => onHover(hospital.id),
            mouseout: () => onHover(null),
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-bold text-slate-900">{hospital.name}</div>
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>{hospital.distance > 0 ? `${hospital.distance.toFixed(1)} mi` : '-'}</span>
                <span className="font-bold text-[#00BFB3]">{hospital.metrics.estOutOfPocket > 0 ? `$${hospital.metrics.estOutOfPocket.toLocaleString()}` : '-'}</span>
              </div>
              <div className="mt-1 text-xs flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{hospital.metrics.overallRating > 0 ? hospital.metrics.overallRating.toFixed(1) : '-'}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
