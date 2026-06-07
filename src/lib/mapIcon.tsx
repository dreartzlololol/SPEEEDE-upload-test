import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';

export const createCustomIcon = (isUrgent: boolean) => {
  return L.divIcon({
    className: isUrgent ? 'custom-leaflet-icon-urgent' : 'custom-leaflet-icon',
    html: renderToStaticMarkup(
      <div className="relative">
        {/* Base Pin: Standard pink circle with MapPin icon (z-10 ensures it sits above pulse rings) */}
        <div className="w-10 h-10 bg-speede-red text-white border border-white/20 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10">
          <MapPin className="w-5 h-5" />
        </div>

        {/* Pulsing / Echoing Ripple Waves (Only for urgent jobs) */}
        {isUrgent && (
          <>
            <div 
              className="absolute top-0 left-0 w-10 h-10 bg-speede-red rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0"
            ></div>
            <div 
              className="absolute top-0 left-0 w-10 h-10 bg-speede-red rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{ animationDelay: '0.6s' }}
            ></div>
            <div 
              className="absolute top-0 left-0 w-10 h-10 bg-speede-red rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{ animationDelay: '1.2s' }}
            ></div>
          </>
        )}
      </div>
    ),
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};
