import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soundEffects } from '@/lib/soundEffects';

export type Theme = 'light' | 'dark' | 'cartoon' | 'scifi' | 'steampunk' | 'system';
export type Language = 'en' | 'th' | 'brainrot';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  primaryColor: string;
  currency: 'THB' | 'USD';
  distanceUnit: 'km' | 'mi';
  jobRadius: number;
  emailNotifs: boolean;
  soundNotifs: boolean;
  profileVisibility: 'public' | 'private';
  
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setPrimaryColor: (color: string) => void;
  setCurrency: (c: 'THB' | 'USD') => void;
  setDistanceUnit: (u: 'km' | 'mi') => void;
  setJobRadius: (r: number) => void;
  setEmailNotifs: (b: boolean) => void;
  setSoundNotifs: (b: boolean) => void;
  setProfileVisibility: (v: 'public' | 'private') => void;
}

const defaultPrimaryColor = '#E60023';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('th');
  const [primaryColor, setPrimaryColorState] = useState(defaultPrimaryColor);
  const [currency, setCurrencyState] = useState<'THB' | 'USD'>('THB');
  const [distanceUnit, setDistanceUnitState] = useState<'km' | 'mi'>('km');
  const [jobRadius, setJobRadiusState] = useState(10);
  const [emailNotifs, setEmailNotifsState] = useState(true);
  const [soundNotifs, setSoundNotifsState] = useState(true);
  const [profileVisibility, setProfileVisibilityState] = useState<'public' | 'private'>('public');

  useEffect(() => {
    // Load saved settings
    const savedTheme = localStorage.getItem('speede_theme') as Theme;
    const savedLang = localStorage.getItem('speede_language') as Language;
    const savedColor = localStorage.getItem('speede_color');
    const savedCurrency = localStorage.getItem('speede_currency') as 'THB' | 'USD';
    const savedDist = localStorage.getItem('speede_dist') as 'km' | 'mi';
    const savedRad = localStorage.getItem('speede_rad');
    const savedEmail = localStorage.getItem('speede_email_notifs');
    const savedSound = localStorage.getItem('speede_sound_notifs');
    const savedVis = localStorage.getItem('speede_visibility') as 'public' | 'private';
    
    if (savedTheme) setThemeState(savedTheme);
    if (savedLang) setLanguageState(savedLang);
    if (savedColor) setPrimaryColorState(savedColor);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedDist) setDistanceUnitState(savedDist);
    if (savedRad) setJobRadiusState(parseInt(savedRad));
    if (savedEmail !== null) setEmailNotifsState(savedEmail === 'true');
    if (savedSound !== null) setSoundNotifsState(savedSound === 'true');
    if (savedVis) setProfileVisibilityState(savedVis);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    // Handle system theme
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Assign standard dark/light class for Tailwind default utilities if needed
    if (effectiveTheme === 'dark' || effectiveTheme === 'scifi') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Set the powerful data-theme attribute
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('speede_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply Color
    const root = window.document.documentElement;
    root.style.setProperty('--speede-primary', primaryColor);
    
    // Naive way to darken/lighten slightly for the darkRed/lightRed variants
    root.style.setProperty('--speede-primary-dark', primaryColor); 
    root.style.setProperty('--speede-primary-light', primaryColor + '33'); // Adding some transparency for 'light' variant

    localStorage.setItem('speede_color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('speede_language', language);
  }, [language]);

  // Global click sound event listener
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"], .cursor-pointer');
      
      if (interactiveEl) {
        // Play click sound using current theme and language
        soundEffects.play('click', theme, language);
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [theme, language]);

  // Persist new settings
  useEffect(() => { localStorage.setItem('speede_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('speede_dist', distanceUnit); }, [distanceUnit]);
  useEffect(() => { localStorage.setItem('speede_rad', jobRadius.toString()); }, [jobRadius]);
  useEffect(() => { localStorage.setItem('speede_email', emailNotifs.toString()); }, [emailNotifs]);
  useEffect(() => { localStorage.setItem('speede_sound', soundNotifs.toString()); }, [soundNotifs]);
  useEffect(() => { localStorage.setItem('speede_vis', profileVisibility); }, [profileVisibility]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setLanguage = (newLang: Language) => setLanguageState(newLang);
  const setPrimaryColor = (newColor: string) => setPrimaryColorState(newColor);
  const setCurrency = (c: 'THB' | 'USD') => setCurrencyState(c);
  const setDistanceUnit = (u: 'km' | 'mi') => setDistanceUnitState(u);
  const setJobRadius = (r: number) => setJobRadiusState(r);
  const setEmailNotifs = (b: boolean) => setEmailNotifsState(b);
  const setSoundNotifs = (b: boolean) => setSoundNotifsState(b);
  const setProfileVisibility = (v: 'public' | 'private') => setProfileVisibilityState(v);

  return (
    <SettingsContext.Provider value={{ 
      theme, language, primaryColor, currency, distanceUnit, jobRadius, emailNotifs, soundNotifs, profileVisibility,
      setTheme, setLanguage, setPrimaryColor, setCurrency, setDistanceUnit, setJobRadius, setEmailNotifs, setSoundNotifs, setProfileVisibility
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
