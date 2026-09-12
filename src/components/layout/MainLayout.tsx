import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { ActiveJobPrompt } from '@/components/jobs/ActiveJobPrompt';
import { TutorialOverlay } from '@/components/ui/TutorialOverlay';
import { AuthModal } from '@/components/auth/AuthModal';
import { QuickChatWidget } from '@/components/chat/QuickChatWidget';

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <div className="min-h-screen pb-16 md:pb-0 flex flex-col transition-colors duration-300 overflow-x-hidden">
      <BackgroundEffects />
      <ActiveJobPrompt />
      <TutorialOverlay />
      <AuthModal />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-16 relative">
        <AnimatePresence mode="wait">
          <div key={location.pathname} className="w-full h-full">
            {outlet}
          </div>
        </AnimatePresence>
      </main>
      <QuickChatWidget />
      <BottomNav />
    </div>
  );
}

