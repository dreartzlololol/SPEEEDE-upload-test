import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { createCustomIcon } from '@/lib/mapIcon';

interface WorkspaceMapProps {
  jobLat: number;
  jobLng: number;
  jobTitle: string;
}

// Haversine formula to calculate distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [bounds, map]);
  return null;
}

export function WorkspaceMap({ jobLat, jobLng, jobTitle }: WorkspaceMapProps) {
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [errorMsg] = useState('');
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    // Simulated offset by roughly 1-2 km
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    setUserLoc([jobLat + latOffset, jobLng + lngOffset]);
  }, [jobLat, jobLng]);

  useEffect(() => {
    if (userLoc) {
      setDistance(getDistance(userLoc[0], userLoc[1], jobLat, jobLng));
    }
  }, [userLoc, jobLat, jobLng]);

  if (!userLoc) return null;

  const mapBounds: [[number, number], [number, number]] = [userLoc, [jobLat, jobLng]];

  const estTimeMins = Math.round((distance / 40) * 60); // Assuming 40km/h avg speed

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer bounds={mapBounds} className="w-full h-full z-0">
        <FitBounds bounds={mapBounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Job Location */}
        <Marker position={[jobLat, jobLng]} icon={createCustomIcon(true)}>
          <Popup>
            <div className="font-bold text-speede-red">Destination</div>
            <div className="text-sm">{jobTitle}</div>
          </Popup>
        </Marker>

        {/* User Location */}
        <Marker position={userLoc} icon={createCustomIcon(false)}>
          <Popup>
            <div className="font-bold text-blue-600">You are here</div>
            {errorMsg && <div className="text-xs text-red-500 mt-1">{errorMsg}</div>}
          </Popup>
        </Marker>

        {/* Route Simulation */}
        <Polyline 
          positions={[userLoc, [jobLat, jobLng]]} 
          color="#FF3366" 
          weight={5} 
          opacity={0.7} 
          dashArray="10, 10" 
        />
      </MapContainer>

      {/* Floating GPS Info Box */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-speede-darkGray/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col gap-2 min-w-[200px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-speede-red/10 flex items-center justify-center text-speede-red shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Navigating</h3>
            <p className="text-sm text-gray-500 font-medium">
              {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`} • {estTimeMins < 1 ? '< 1' : estTimeMins} mins
            </p>
          </div>
        </div>
        {errorMsg && (
          <div className="text-xs text-amber-500 font-medium mt-1 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800/30">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
