import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSettings } from '@/contexts/SettingsContext';
import { soundEffects } from '@/lib/soundEffects';

export default function BottomNav() {
  const location = useLocation();
  const { theme, language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const navItems = [
    { icon: Home, label: isRot ? 'Quests' : isTh ? 'งาน' : 'Feed', path: '/feed' },
    { icon: MapPin, label: isRot ? 'The Ends' : isTh ? 'แผนที่' : 'Map', path: '/map' },
    { icon: PlusCircle, label: isRot ? 'Drop' : isTh ? 'ลงประกาศ' : 'Post', path: '/post-job', activeColor: 'text-speede-red' },
    { icon: MessageSquare, label: isRot ? 'Yaps' : isTh ? 'แชท' : 'Chat', path: '/chat' },
    { icon: User, label: isRot ? 'Me' : isTh ? 'ฉัน' : 'Profile', path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 theme-panel z-50 px-6 py-3">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              id={`tutorial-nav-${item.path.slice(1)}`}
              to={item.path}
              onClick={() => soundEffects.play('click', theme, language)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all",
                isActive ? (item.activeColor || "text-speede-red") : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                isActive && "transform -translate-y-1"
              )}
            >
              <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
