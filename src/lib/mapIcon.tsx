import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';

export const customIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: renderToStaticMarkup(
    <div className="relative">
      <div className="w-10 h-10 bg-speede-red text-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
        <MapPin className="w-5 h-5" />
      </div>
      <div className="absolute inset-0 bg-speede-red rounded-full animate-ping opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
  ),
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});
