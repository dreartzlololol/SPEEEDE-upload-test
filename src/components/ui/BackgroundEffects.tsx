import { useSettings } from '@/contexts/SettingsContext';
import { Settings as GearIcon } from 'lucide-react';

export function BackgroundEffects() {
  const { theme } = useSettings();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {theme === 'cartoon' && (
        <div className="absolute inset-0 opacity-20 mix-blend-multiply">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, rgba(50, 20, 0, 0.4) 100%)' }} />
          <div className="absolute inset-0 bg-[#FFAA00] mix-blend-color opacity-30" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '4px 100%' }} />
        </div>
      )}

      {theme === 'scifi' && (
        <>
          <div className="absolute inset-0 opacity-50 mix-blend-screen">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[rgba(0,243,255,0.05)] blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-[rgba(255,0,60,0.05)] blur-[120px]" />
          </div>
          {/* Animated 3D Cyberpunk Grid */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-screen"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transformOrigin: 'center top',
              animation: 'gridMove 3s linear infinite'
            }}
          />
          {/* Fade out grid at the top */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent opacity-90 h-1/2" />
        </>
      )}

      {theme === 'steampunk' && (
        <>
          <div className="absolute inset-0 mix-blend-multiply opacity-40">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 120%, rgba(193, 103, 56, 0.4) 0%, transparent 70%)' }} />
          </div>
          {/* Gears and Pipes */}
          <div className="absolute inset-0 opacity-[0.03] text-[#8C6239]">
            <GearIcon className="absolute -top-20 -left-20 w-[400px] h-[400px] animate-[spin_60s_linear_infinite]" />
            <GearIcon className="absolute top-40 -left-40 w-[200px] h-[200px] animate-[spin_40s_linear_infinite_reverse]" />
            <GearIcon className="absolute -bottom-20 -right-20 w-[500px] h-[500px] animate-[spin_80s_linear_infinite]" />
            <GearIcon className="absolute bottom-60 right-20 w-[150px] h-[150px] animate-[spin_30s_linear_infinite_reverse]" />
            
            {/* Background Pipes */}
            <div className="absolute top-0 bottom-0 left-20 w-8 bg-gradient-to-r from-transparent via-current to-transparent" />
            <div className="absolute top-0 bottom-0 right-32 w-12 bg-gradient-to-r from-transparent via-current to-transparent" />
            <div className="absolute top-32 left-0 right-0 h-6 bg-gradient-to-b from-transparent via-current to-transparent" />
          </div>
        </>
      )}
    </div>
  );
}
