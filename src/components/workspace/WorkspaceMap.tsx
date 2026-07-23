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
  const [errorMsg, setErrorMsg] = useState('');
  const [distance, setDistance] = useState<number>(0);
  const [isRealLocation, setIsRealLocation] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [currentStep, setCurrentStep] = useState<{ icon: string; text: string; dist: number } | null>(null);

  useEffect(() => {
    let watchId: number;

    const applyFallback = (errText?: string) => {
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      setUserLoc([jobLat + latOffset, jobLng + lngOffset]);
      setIsRealLocation(false);
      if (errText) setErrorMsg(errText);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLoc([position.coords.latitude, position.coords.longitude]);
          setIsRealLocation(true);
          setErrorMsg('');
        },
        (error) => {
          console.warn("Geolocation watch position error, using simulated location:", error);
          applyFallback("Using simulated location (GPS unavailable)");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      applyFallback("Geolocation not supported by browser");
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [jobLat, jobLng]);

  // Fetch traffic-rule compliant road route geometry from OSRM
  useEffect(() => {
    if (!userLoc) return;

    const fetchRoadRoute = async () => {
      try {
        const uLat = userLoc[0];
        const uLng = userLoc[1];
        // Enforce continue_straight, steps, and annotations to obey traffic direction and legal maneuvers
        const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${jobLng},${jobLat}?overview=full&geometries=geojson&steps=true&continue_straight=true&annotations=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
          setRouteGeometry(coords);
          setDistance(route.distance / 1000);

          if (route.legs && route.legs[0] && route.legs[0].steps && route.legs[0].steps.length > 0) {
            const step = route.legs[0].steps[0];
            const modifier = step.maneuver.modifier || '';
            const type = step.maneuver.type || '';
            const street = step.name ? ` onto ${step.name}` : '';
            let icon = '⬆️';
            let text = `Continue straight${street}`;
            if (modifier.includes('left')) { icon = '⬅️'; text = `Turn left${street}`; }
            else if (modifier.includes('right')) { icon = '➡️'; text = `Turn right${street}`; }
            else if (modifier.includes('uturn') || type.includes('uturn')) { icon = '↩️'; text = `Legal U-turn${street}`; }
            else if (type.includes('arrive')) { icon = '🏁'; text = `Arrive at destination`; }

            setCurrentStep({ icon, text, dist: Math.round(step.distance) });
          }
        } else {
          setRouteGeometry([userLoc, [jobLat, jobLng]]);
          setDistance(getDistance(userLoc[0], userLoc[1], jobLat, jobLng));
        }
      } catch (err) {
        console.warn("OSRM routing error, fallback to straight line:", err);
        setRouteGeometry([userLoc, [jobLat, jobLng]]);
        setDistance(getDistance(userLoc[0], userLoc[1], jobLat, jobLng));
      }
    };

    fetchRoadRoute();
  }, [userLoc, jobLat, jobLng]);

  if (!userLoc) return null;

  const mapBounds: [[number, number], [number, number]] = [userLoc, [jobLat, jobLng]];
  const estTimeMins = Math.max(1, Math.round((distance / 35) * 60));

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
        <Marker position={userLoc} icon={createCustomIcon(false, true)}>
          <Popup>
            <div className="font-bold text-blue-600">{isRealLocation ? 'Your Real-Life Location' : 'Simulated Location'}</div>
            {errorMsg && <div className="text-xs text-amber-600 mt-1">{errorMsg}</div>}
          </Popup>
        </Marker>

        {/* Traffic-rule obeying road route polyline */}
        {routeGeometry.length > 0 && (
          <Polyline 
            positions={routeGeometry} 
            color="#2563eb" 
            weight={6} 
            opacity={0.85} 
          />
        )}
      </MapContainer>

      {/* Floating Traffic-Rule Guidance Info Box */}
      <div className="absolute top-4 left-4 right-4 md:right-auto z-[400] bg-emerald-800 text-white p-4 rounded-2xl shadow-xl border border-emerald-700/50 flex flex-col gap-2 min-w-[240px]">
        <div className="flex items-center gap-3">
          {currentStep ? (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              {currentStep.icon}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
          )}
          <div className="overflow-hidden">
            <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Traffic-Rule Navigation</div>
            <h3 className="font-bold text-sm truncate">
              {currentStep ? `In ${currentStep.dist}m, ${currentStep.text}` : 'Navigating legally'}
            </h3>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`} • ~{estTimeMins} mins drive
            </p>
          </div>
        </div>
        {errorMsg && (
          <div className="text-xs text-amber-200 font-medium mt-1 bg-amber-950/40 p-2 rounded-lg border border-amber-800/30">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
