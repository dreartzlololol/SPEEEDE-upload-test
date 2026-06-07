import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialContextType {
  isActive: boolean;
  hasSeenTutorial: boolean;
  startTutorial: () => void;
  finishTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // Default to true while loading
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('speede_has_seen_tutorial');
    if (!stored) {
      setHasSeenTutorial(false);
      setIsActive(true); // Automatically start on first visit
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
  };

  const finishTutorial = () => {
    setIsActive(false);
    setHasSeenTutorial(true);
    localStorage.setItem('speede_has_seen_tutorial', 'true');
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
