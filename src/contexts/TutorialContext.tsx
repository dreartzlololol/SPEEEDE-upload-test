import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TutorialContextType {
  isActive: boolean;
  hasSeenTutorial: boolean;
  startTutorial: () => void;
  finishTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user, showAuthModal } = useAuth();
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // Default to true while loading
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkServerSession = async () => {
      try {
        const response = await fetch('/api/server-info', {
          headers: {
            'bypass-tunnel-reminder': 'true'
          }
        });
        if (response.ok) {
          const data = await response.json();
          const localServerId = localStorage.getItem('speede_server_start_id');
          if (localServerId !== data.serverStartId) {
            // Server restarted! Clear tutorial seen state
            localStorage.removeItem('speede_has_seen_tutorial');
            localStorage.setItem('speede_server_start_id', data.serverStartId);
            setHasSeenTutorial(false);
            setIsActive(true);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch server info:', err);
      }

      // Check localStorage as fallback if server check was same or failed
      const stored = localStorage.getItem('speede_has_seen_tutorial');
      if (!stored) {
        setHasSeenTutorial(false);
        setIsActive(true); // Automatically start on first visit
      } else {
        setHasSeenTutorial(true);
      }
    };

    checkServerSession();
  }, []);

  const startTutorial = () => {
    setIsActive(true);
  };

  const finishTutorial = () => {
    setIsActive(false);
    setHasSeenTutorial(true);
    localStorage.setItem('speede_has_seen_tutorial', 'true');
    if (!user) {
      showAuthModal();
    }
  };

  return (
    <TutorialContext.Provider value={{ isActive, hasSeenTutorial, startTutorial, finishTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

