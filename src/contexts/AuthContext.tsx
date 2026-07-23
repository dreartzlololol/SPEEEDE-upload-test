import { createContext, useContext, useState, ReactNode } from 'react';

const API_BASE = '/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type User = {
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  bio: string;
  skills: string[];
  completedJobs: number;
  rating: number;
  reviews: any[];
  isAdmin?: boolean;
  friends?: string[];
  friendTags?: Record<string, string[]>;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAuthModalOpen: boolean;
  showAuthModal: () => void;
  closeAuthModal: () => void;
}

import { useSettings } from '@/contexts/SettingsContext';
import { soundEffects } from '@/lib/soundEffects';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { theme, language } = useSettings();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('speede_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const showAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('speede_user', JSON.stringify(data.user));
        soundEffects.play('success', theme, language);
        return true;
      }
      soundEffects.play('failure', theme, language);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      soundEffects.play('failure', theme, language);
      return false;
    }
  };

  const register = async (emailInput: string, passwordInput: string, nameInput: string, phoneInput: string): Promise<void> => {
    const email = (emailInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();
    const name = (nameInput || '').trim();
    const phone = (phoneInput || '').trim();

    if (!email || !password || !name) {
      throw new Error(language === 'th' ? 'กรุณากรอกอีเมล รหัสผ่าน และชื่อให้ครบถ้วน' : 'Email, password, and name are required');
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({ email, password, name, phone })
      });

      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('speede_user', JSON.stringify(data.user));
        }
        soundEffects.play('success', theme, language);
        return;
      }

      soundEffects.play('failure', theme, language);
      let errMsg = language === 'th' ? 'การลงทะเบียนล้มเหลว' : 'Registration failed';
      try {
        const errText = await response.text();
        if (errText) {
          const errData = JSON.parse(errText);
          if (errData.error === 'Email already registered') {
            errMsg = language === 'th' ? 'อีเมลนี้ถูกลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ' : 'Email is already registered. Please log in.';
          } else {
            errMsg = errData.error || errMsg;
          }
        }
      } catch (_) { /* ignore JSON parse errors */ }
      throw new Error(errMsg);

    } catch (err: any) {
      // Fallback to local user session if backend server is unreachable (e.g. Vercel static deployment)
      if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn("Backend API unreachable, using local session fallback for registration:", err);
        const newUser: User = {
          name,
          email,
          phone: phone || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          bio: '',
          skills: [],
          completedJobs: 0,
          rating: 5.0,
          reviews: [],
          isAdmin: false,
        };
        setUser(newUser);
        localStorage.setItem('speede_user', JSON.stringify(newUser));
        soundEffects.play('success', theme, language);
        return;
      }

      soundEffects.play('failure', theme, language);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('speede_user');
    soundEffects.play('click', theme, language);
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (user) {
      try {
        const response = await fetch(`${API_BASE}/auth/update`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true'
          },
          body: JSON.stringify({ email: user.email, updates })
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('speede_user', JSON.stringify(data.user));
          soundEffects.play('success', theme, language);
        } else {
          soundEffects.play('failure', theme, language);
          const errData = await response.json();
          throw new Error(errData.error || 'Profile update failed');
        }
      } catch (err) {
        soundEffects.play('failure', theme, language);
        throw err;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, updateUser, 
      isAuthModalOpen, showAuthModal, closeAuthModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
