import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, Navigation } from 'lucide-react';

export const createCustomIcon = (isUrgent: boolean, isUser: boolean = false) => {
  const pinBg = isUser ? 'bg-blue-600' : 'bg-speede-red';
  const IconComponent = isUser ? Navigation : MapPin;
  const iconClass = isUser ? 'w-5 h-5 fill-current transform rotate-45' : 'w-5 h-5';
  const pulseColor = isUser ? 'bg-blue-600' : 'bg-speede-red';

  return L.divIcon({
    className: isUser ? 'custom-leaflet-icon-user' : (isUrgent ? 'custom-leaflet-icon-urgent' : 'custom-leaflet-icon'),
    html: renderToStaticMarkup(
      <div className="relative">
        {/* Base Pin (z-10 ensures it sits above pulse rings) */}
        <div className={`w-10 h-10 ${pinBg} text-white border border-white/20 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10`}>
          <IconComponent className={iconClass} />
        </div>

        {/* Pulsing / Echoing Ripple Waves */}
        {(isUrgent || isUser) && (
          <>
            <div 
              className={`absolute top-0 left-0 w-10 h-10 ${pulseColor} rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0`}
            ></div>
            <div 
              className={`absolute top-0 left-0 w-10 h-10 ${pulseColor} rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0`}
              style={{ animationDelay: '0.6s' }}
            ></div>
            {(isUrgent) && (
              <div 
                className={`absolute top-0 left-0 w-10 h-10 ${pulseColor} rounded-full animate-custom-ping -z-10 transform -translate-x-1/2 -translate-y-1/2 opacity-0`}
                style={{ animationDelay: '1.2s' }}
              ></div>
            )}
          </>
        )}
      </div>
    ),
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const createGoogleUserDotIcon = () => {
  return L.divIcon({
    className: 'google-maps-user-dot',
    html: renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
        {/* Pulsing Outer Glow */}
        <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
        {/* White Border Ring with Solid Blue Center Dot */}
        <div className="w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-[0_0_10px_rgba(37,99,235,0.9)] z-10"></div>
      </div>
    ),
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

