import { useState, useEffect } from 'react';
import { useJobs, Job } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { createCustomIcon, createGoogleUserDotIcon } from '@/lib/mapIcon';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { ApplicationModal } from '@/components/jobs/ApplicationModal';
import { PageTransition } from '@/components/ui/PageTransition';
import { Search, MapPin, LocateFixed, Layers, Navigation2 } from 'lucide-react';

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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

const TILE_LAYERS = {
  standard: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS'
  }
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}

function LeafletLocationBinder({ onLocationFound }: { onLocationFound: (lat: number, lng: number, accuracy: number) => void }) {
  const map = useMap();
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });

    const handleFound = (e: any) => {
      onLocationFound(e.latlng.lat, e.latlng.lng, e.accuracy || 50);
    };

    map.on('locationfound', handleFound);
    return () => {
      map.off('locationfound', handleFound);
    };
  }, [map, onLocationFound]);
  return null;
}

export default function MapView() {
  const { jobs } = useJobs();
  const { user, showAuthModal } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailedJob, setDetailedJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Default Photharam District, Ratchaburi approximate coordinates
  const defaultCenter: [number, number] = [13.6922, 99.8536];
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [accuracyRadius, setAccuracyRadius] = useState<number>(50);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      const data = await res.json();
      if (data && data.address) {
        const area = data.address.suburb || data.address.town || data.address.city || data.address.village || data.address.county;
        const province = data.address.state || data.address.province;
        if (area && province) {
          setLocationName(`${area}, ${province}`);
        } else if (data.display_name) {
          const parts = data.display_name.split(',');
          setLocationName(`${parts[0].trim()}, ${parts[parts.length - 1].trim()}`);
        }
      }
    } catch (err) {
      console.warn("Reverse geocoding error:", err);
    }
  };

  const handleLocationFound = (lat: number, lng: number, accuracy: number) => {
    const coords: [number, number] = [lat, lng];
    setUserLocation(coords);
    setMapCenter(coords);
    setAccuracyRadius(accuracy);
    fetchLocationName(lat, lng);
    setIsLocating(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationName('Geolocation not supported');
      return;
    }
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 50);
      },
      (err) => {
        console.warn("Standard browser location failed, attempting fallback:", err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            handleLocationFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 50);
          },
          (err2) => {
            console.error("Browser location unavailable:", err2);
            setLocationName('Photharam District, Ratchaburi');
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
      { timeout: 5000 }
    );
  };

  // Live search suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=en&limit=4`);
        const data = await res.json();
        if (data) setSuggestions(data);
      } catch (err) {
        console.warn("Search suggestion error:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const coords: [number, number] = [lat, lon];
    setUserLocation(coords);
    setMapCenter(coords);
    setLocationName(item.display_name.split(',')[0]);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=en`);
      const data = await res.json();
      if (data && data.length > 0) {
        selectSuggestion(data[0]);
      } else {
        alert("Location not found. Please try another place name.");
      }
    } catch (err) {
      console.error("Location search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Continuous real-time GPS location watching
  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          handleLocationFound(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 50);
        },
        (err) => console.warn("Watch position notice:", err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    }
    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [roadDistance, setRoadDistance] = useState<number | null>(null);
  const [roadDuration, setRoadDuration] = useState<number | null>(null);
  const [turnInstruction, setTurnInstruction] = useState<{ icon: string; text: string; dist: number } | null>(null);

  // Fetch real road route geometry from OSRM that snaps along roads and obeys traffic rules
  useEffect(() => {
    if (!selectedJob || !userLocation) {
      setRouteGeometry([]);
      setRoadDistance(null);
      setRoadDuration(null);
      setTurnInstruction(null);
      return;
    }

    const fetchRoadRoute = async () => {
      try {
        const uLat = userLocation[0];
        const uLng = userLocation[1];
        const jLat = selectedJob.lat;
        const jLng = selectedJob.lng;

        // Strict traffic-rule parameters: continue_straight=true, steps=true, annotations=true
        const url = `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${jLng},${jLat}?overview=full&geometries=geojson&steps=true&continue_straight=true&annotations=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
          setRouteGeometry(coords);
          setRoadDistance(route.distance / 1000);
          setRoadDuration(Math.ceil(route.duration / 60));

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
            else if (type.includes('arrive')) { icon = '🏁'; text = `Arrive at job location`; }

            setTurnInstruction({ icon, text, dist: Math.round(step.distance) });
          }
        } else {
          setRouteGeometry([userLocation, [selectedJob.lat, selectedJob.lng]]);
          const dist = getDistanceInKm(userLocation[0], userLocation[1], selectedJob.lat, selectedJob.lng);
          setRoadDistance(dist);
          setRoadDuration(Math.max(1, Math.round((dist / 35) * 60)));
          setTurnInstruction(null);
        }
      } catch (err) {
        console.warn("OSRM routing error, using fallback straight line:", err);
        setRouteGeometry([userLocation, [selectedJob.lat, selectedJob.lng]]);
        const dist = getDistanceInKm(userLocation[0], userLocation[1], selectedJob.lat, selectedJob.lng);
        setRoadDistance(dist);
        setRoadDuration(Math.max(1, Math.round((dist / 35) * 60)));
        setTurnInstruction(null);
      }
    };

    fetchRoadRoute();
  }, [selectedJob, userLocation]);

  return (
    <PageTransition className="relative w-full h-[calc(100vh-10rem)] theme-panel overflow-hidden z-0">
      
      <MapContainer center={mapCenter} zoom={13} className="w-full h-full z-0">
        <RecenterMap center={mapCenter} />
        <LeafletLocationBinder onLocationFound={handleLocationFound} />
        <TileLayer
          attribution={TILE_LAYERS[mapType].attribution}
          url={TILE_LAYERS[mapType].url}
        />

        {/* Real Road Route Polyline (bends, turns, and snaps along actual streets) */}
        {selectedJob && userLocation && routeGeometry.length > 0 && (
          <Polyline
            positions={routeGeometry}
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />
        )}

        {/* User Location: Google Maps Style Blue Dot & Accuracy Circle */}
        {userLocation && (
          <>
            <Circle 
              center={userLocation} 
              radius={Math.min(accuracyRadius, 500)} 
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1.5 }} 
            />
            <Marker 
              position={userLocation} 
              icon={createGoogleUserDotIcon()}
              draggable={false}
            >
              <Popup>
                <div className="font-bold text-blue-600 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></div> Your Location
                </div>
                <div className="text-xs text-gray-500">{userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}</div>
                <div className="text-[10px] text-blue-500 font-medium mt-1">💡 Drag dot or tap map to adjust</div>
              </Popup>
            </Marker>
          </>
        )}
        
        {jobs.map((job) => (
          <Marker 
            key={job.id} 
            position={[job.lat, job.lng]}
            icon={createCustomIcon(!!job.isUrgent)}
            eventHandlers={{
              click: () => setSelectedJob(job),
            }}
          />
        ))}
      </MapContainer>

      {/* Top Search Bar & Location Suggestions */}
      <div className="absolute z-10 top-6 left-6 right-20 md:right-auto md:w-96 flex flex-col gap-2">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg rounded-2xl overflow-hidden bg-white/90 dark:bg-speede-darkGray/90 backdrop-blur-md border border-gray-100 dark:border-gray-800">
          <input
            type="text"
            placeholder="Search address or city like Google Maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-transparent text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="absolute right-1 px-3 py-1.5 text-speede-red hover:opacity-80 transition-opacity">
            <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
          </button>
        </form>

        {/* Live Search Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/95 dark:bg-speede-darkGray/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800"
            >
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(item)}
                  className="px-4 py-2.5 text-left text-xs text-gray-700 dark:text-gray-200 hover:bg-speede-red/10 hover:text-speede-red flex items-center gap-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-speede-red shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-medium shadow-sm border border-white/20 text-gray-700 dark:text-gray-200 flex items-center gap-2 w-fit">
          <MapPin className="w-3.5 h-3.5 text-speede-red shrink-0" />
          <span>{locationName}</span>
        </div>

        {/* Google Maps Turn-by-Turn Guidance Banner */}
        <AnimatePresence>
          {selectedJob && turnInstruction && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-800 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-700/50 mt-1"
            >
              <div className="text-xl bg-white/20 p-2 rounded-xl shrink-0">
                {turnInstruction.icon}
              </div>
              <div className="flex flex-col overflow-hidden">
                <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Traffic-Rule Navigation</div>
                <div className="text-xs font-bold truncate">
                  In {turnInstruction.dist < 1000 ? `${turnInstruction.dist}m` : `${(turnInstruction.dist / 1000).toFixed(1)}km`}, {turnInstruction.text}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Control Buttons (Layer Switcher & Google Maps Target Button) */}
      <div className="absolute z-10 top-6 right-6 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className={`bg-white/90 dark:bg-speede-darkGray/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all text-blue-600 dark:text-blue-400 ${isLocating ? 'animate-pulse' : ''}`}
          title="Recenter on Google Maps Blue Dot"
        >
          <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          className="bg-white/90 dark:bg-speede-darkGray/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:scale-105 transition-all text-gray-700 dark:text-gray-200 flex items-center justify-center"
          title={`Switch to ${mapType === 'standard' ? 'Satellite' : 'Standard'} Map`}
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Job Card Overlay with Route & Distance */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute z-10 bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white dark:bg-speede-darkGray p-4 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold dark:text-white text-lg leading-tight">{selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            {/* Google Maps Real Road Distance & Driving Time Banner */}
            {userLocation && roadDistance !== null && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm">
                <Navigation2 className="w-4 h-4 fill-current shrink-0 text-blue-600" />
                <span>
                  {roadDistance < 1 ? `${(roadDistance * 1000).toFixed(0)} m` : `${roadDistance.toFixed(1)} km`} • ~{roadDuration} mins drive (via roads)
                </span>
              </div>
            )}

            <div className="text-speede-red font-bold mb-2">{selectedJob.salary}</div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{selectedJob.description}</p>
            <button 
              onClick={() => setDetailedJob(selectedJob)}
              className="w-full py-2 bg-speede-black text-white dark:bg-white dark:text-speede-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailedJob && (
          <JobDetailsModal 
            job={detailedJob} 
            onClose={() => setDetailedJob(null)}
            onApply={() => {
              if (!user) {
                showAuthModal();
                return;
              }
              setDetailedJob(null);
              setApplyingJob(detailedJob);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyingJob && (
          <ApplicationModal 
            job={applyingJob} 
            onClose={() => setApplyingJob(null)} 
            onSuccess={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-speede-black text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-50 whitespace-nowrap"
          >
            Application sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

