import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { soundEffects } from '@/lib/soundEffects';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent' | 'message';
  timestamp: string;
  read: boolean;
  link?: string;
  data?: any;
}

const API_BASE = '/api';

export const pushNotificationToUser = async (
  userEmail: string, 
  title: string, 
  message: string, 
  type: Notification['type'], 
  link?: string, 
  data?: any
) => {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userEmail,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    link,
    data
  };

  try {
    await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true'
      },
      body: JSON.stringify(newNotif)
    });
  } catch(e) { console.error(e); }
  
  // Custom event so the current tab can update if it happens to be the same user
  window.dispatchEvent(new CustomEvent('speede_notif_added', { detail: { userEmail } }));
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string, type: Notification['type'], link?: string, data?: any) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { theme, language } = useSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user-specific notifications from API

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/notifications?email=${encodeURIComponent(user.email)}`, {
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch(e) { console.error(e); }
  };

  // Load user-specific notifications from API
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.userEmail.toLowerCase() === user.email.toLowerCase()) {
        fetchNotifications();
      }
    };
    
    window.addEventListener('speede_notif_added', handleStorageChange as EventListener);
    
    // Polling fallback
    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      window.removeEventListener('speede_notif_added', handleStorageChange as EventListener);
      clearInterval(interval);
    };
  }, [user, language]);

  const addNotification = async (title: string, message: string, type: Notification['type'], link?: string, data?: any) => {
    if (!user) return;
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      link,
      data
    };

    setNotifications([newNotif, ...notifications]);

    try {
      await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({ ...newNotif, userEmail: user.email })
      });
    } catch (e) { console.error(e); }

    // Play appropriate sound
    if (type === 'success') {
      soundEffects.play('success', theme, language);
    } else if (type === 'message') {
      soundEffects.play('message', theme, language);
    } else {
      soundEffects.play('click', theme, language);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
    } catch(e) {}
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    for (const n of notifications.filter(notif => !notif.read)) {
      try {
        await fetch(`${API_BASE}/notifications/${n.id}/read`, {
          method: 'POST',
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
      } catch(e) {}
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    if (!user) return;
    try {
      await fetch(`${API_BASE}/notifications?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
        headers: { 'bypass-tunnel-reminder': 'true' }
      });
    } catch(e) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
