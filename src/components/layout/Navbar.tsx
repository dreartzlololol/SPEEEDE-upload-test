import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Download, Bell, Settings as SettingsIcon, UserPlus, Users } from 'lucide-react';
import { useAuth, User } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Application } from '@/contexts/JobContext';
import { ReviewApplicationModal } from '@/components/jobs/ReviewApplicationModal';
import { UserSearchModal } from '@/components/user/UserSearchModal';
import { AnimatePresence, motion } from 'framer-motion';
import { InvincibleEasterEgg } from '@/components/ui/InvincibleEasterEgg';
import { soundEffects } from '@/lib/soundEffects';
import { useNotifications, pushNotificationToUser } from '@/contexts/NotificationContext';

export default function Navbar() {
  const { user, showAuthModal, updateUser } = useAuth();
  const { theme, language } = useSettings();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoPulse, setLogoPulse] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const handleDownload = () => {
    soundEffects.play('click', theme, language);
    
    // Determine installer file name based on OS
    const userAgent = navigator.userAgent.toLowerCase();
    let fileName = 'SpeedE-Setup.exe';
    
    if (/android/.test(userAgent)) {
      fileName = 'SpeedE.apk';
    } else if (/macintosh|mac os x/.test(userAgent)) {
      fileName = 'SpeedE-Installer.dmg';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      fileName = 'SpeedE.mobileconfig';
    }
    
    // Trigger download programmatically from direct server static asset
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show download started notification
    addNotification(
      isTh ? 'เริ่มดาวน์โหลดสำเร็จ! 📥' : isRot ? 'Downloading the setup! 📥' : 'Download Started! 📥',
      isTh ? `กำลังดาวน์โหลดไฟล์ติดตั้ง "${fileName}" สำหรับอุปกรณ์ของคุณ` : isRot ? `Downloading "${fileName}" for your device.` : `Downloading installer "${fileName}" for your device.`,
      'success'
    );
  };

  const handleLogoClick = useCallback(() => {
    soundEffects.play('click', theme, language);
    navigate('/');
    setLogoPulse(true);
    setTimeout(() => setLogoPulse(false), 300);
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (newCount >= 7) {
      setShowEasterEgg(true);
      setLogoClickCount(0);
    } else {
      logoClickTimer.current = setTimeout(() => setLogoClickCount(0), 2000);
    }
  }, [logoClickCount, navigate, theme, language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAcceptFriend = async (notif: any) => {
    if (!user) return;
    const senderEmail = notif.data?.senderEmail;
    if (!senderEmail) return;

    try {
      // 1. Update current user's friends list
      const currentFriends = user.friends || [];
      if (!currentFriends.includes(senderEmail)) {
        await updateUser({ friends: [...currentFriends, senderEmail] });
      }

      // 2. Fetch sender's profile to get their current friends list
      const resUsers = await fetch('/api/users', { headers: { 'bypass-tunnel-reminder': 'true' } });
      if (resUsers.ok) {
        const users: User[] = await resUsers.json();
        const senderUser = users.find(u => u.email.toLowerCase() === senderEmail.toLowerCase());
        const senderFriends = senderUser?.friends || [];
        if (!senderFriends.includes(user.email)) {
          // Update sender's friends list
          await fetch('/api/auth/update', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'bypass-tunnel-reminder': 'true'
            },
            body: JSON.stringify({ 
              email: senderEmail, 
              updates: { friends: [...senderFriends, user.email] } 
            })
          });
        }
      }

      // 3. Mark notification as read
      await markAsRead(notif.id);

      // 4. Send notification back to sender
      await pushNotificationToUser(
        senderEmail,
        isTh ? 'ยอมรับคำขอเป็นเพื่อน 🤝' : 'Friend Request Accepted 🤝',
        isTh ? `${user.name} ยอมรับคำขอเป็นเพื่อนของคุณแล้ว!` : `${user.name} accepted your friend request!`,
        'success',
        undefined,
        { type: 'friend_accepted', senderEmail: user.email, senderName: user.name }
      );

      soundEffects.play('success', theme, language);
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleDeclineFriend = async (notif: any) => {
    try {
      await markAsRead(notif.id);
      soundEffects.play('click', theme, language);
    } catch (err) {
      console.error('Failed to decline friend request:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 theme-panel !rounded-none !border-t-0 !border-l-0 !border-r-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <motion.div
          onClick={handleLogoClick}
          animate={logoPulse ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 cursor-pointer select-none theme-panel rounded-full px-3 py-1 bg-white dark:bg-speede-darkGray"
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-[var(--theme-border-radius)] bg-theme-primary border-[var(--theme-border-width)] border-[var(--theme-border-color)] overflow-hidden" style={{ boxShadow: 'var(--theme-shadow)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"></polygon>
            </svg>
          </div>
          <span className="text-3xl font-display tracking-widest text-theme-text">SPEED<span className="text-theme-primary">E</span></span>
          {logoClickCount >= 3 && logoClickCount < 7 && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-400 font-bold ml-1"
            >
              {7 - logoClickCount} more...
            </motion.span>
          )}
        </motion.div>
        
        <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <Button variant="secondary" size="sm" id="tutorial-desktop-feed" onClick={() => { soundEffects.play('click', theme, language); navigate('/feed'); }} className="select-none px-3.5">
            {isRot ? 'Side Quests' : isTh ? 'งาน' : 'Jobs'}
          </Button>
          <Button variant="secondary" size="sm" id="tutorial-desktop-map" onClick={() => { soundEffects.play('click', theme, language); navigate('/map'); }} className="select-none px-3.5">
            {isRot ? 'The Ends' : isTh ? 'แผนที่' : 'Map'}
          </Button>
          <Button variant="secondary" size="sm" id="tutorial-desktop-chat" onClick={() => {
            soundEffects.play('click', theme, language);
            if (!user) showAuthModal();
            else navigate('/chat');
          }} className="select-none px-3.5">
            {isRot ? 'Yapping' : isTh ? 'ข้อความ' : 'Messages'}
          </Button>
          <Button variant="secondary" size="sm" id="tutorial-desktop-accounts" onClick={() => {
            soundEffects.play('click', theme, language);
            setShowUserSearchModal(true);
          }} className="select-none px-3.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-theme-primary" />
            {isRot ? 'Homies' : isTh ? 'ค้นหาบัญชี' : 'Accounts'}
          </Button>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button variant="secondary" size="sm" id="tutorial-desktop-accounts-icon" onClick={() => {
            soundEffects.play('click', theme, language);
            setShowUserSearchModal(true);
          }} className="md:hidden w-10 px-0 h-10 flex items-center justify-center select-none" title={isTh ? 'ค้นหาบัญชีผู้ใช้' : 'Search Accounts & Add Friends'}>
            <UserPlus className="w-5 h-5 text-theme-primary" />
          </Button>

          <Button variant="secondary" size="sm" id="tutorial-desktop-settings" onClick={() => {
            soundEffects.play('click', theme, language);
            if (!user) showAuthModal();
            else navigate('/settings');
          }} className="w-10 px-0 h-10 flex items-center justify-center select-none">
            <SettingsIcon className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="secondary"
              size="sm"
              id="tutorial-desktop-notifications"
              onClick={() => {
                soundEffects.play('click', theme, language);
                setShowNotifications(!showNotifications);
              }}
              className="relative w-10 px-0 h-10 flex items-center justify-center select-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-speede-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-theme-border-color">
                  {unreadCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-speede-darkGray rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-speede-black/30">
                    <h3 className="font-bold dark:text-white text-sm">
                      {isRot ? 'Pings' : isTh ? 'การแจ้งเตือน' : 'Notifications'}
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs text-theme-primary font-bold hover:underline"
                      >
                        {isRot ? 'Read All' : isTh ? 'อ่านทั้งหมด' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        {isRot ? 'No vibe checks yet fr 💀' : isTh ? 'ไม่มีการแจ้งเตือน' : 'No notifications.'}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-speede-black/50 cursor-pointer transition-colors relative border-l-4 ${
                            !n.read ? 'bg-theme-primary/5 dark:bg-theme-primary/5' : ''
                          } ${
                            n.type === 'urgent' ? 'border-l-speede-red' : 
                            n.type === 'success' ? 'border-l-green-500' :
                            n.type === 'message' ? 'border-l-blue-500' :
                            'border-l-gray-300 dark:border-l-gray-700'
                          }`}
                          onClick={() => {
                            if (n.data && n.data.type === 'friend_request' && !n.read) {
                              return;
                            }
                            soundEffects.play('click', theme, language);
                            markAsRead(n.id);
                            setShowNotifications(false);
                            if (n.data && n.data.application) {
                              setSelectedApplication(n.data.application);
                            } else if (n.link) {
                              navigate(n.link);
                            }
                          }}
                        >
                          {!n.read && (
                            <span className="absolute top-4 right-4 w-2 h-2 bg-theme-primary rounded-full" />
                          )}
                          <p className={`text-xs font-bold ${!n.read ? 'text-theme-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-sm dark:text-white mt-0.5 leading-snug">
                            {n.message}
                          </p>

                          {/* Accept/Decline Buttons for Friend Request */}
                          {n.data && n.data.type === 'friend_request' && !n.read && (
                            <div className="flex gap-2 mt-2.5 mb-1" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleAcceptFriend(n)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                              >
                                {isTh ? 'ยอมรับ' : 'Accept'}
                              </button>
                              <button 
                                onClick={() => handleDeclineFriend(n)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors border border-theme-border-color"
                              >
                                {isTh ? 'ปฏิเสธ' : 'Decline'}
                              </button>
                            </div>
                          )}

                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => clearAll()}
                      className="w-full text-center py-2.5 text-xs text-gray-500 hover:text-speede-red font-bold border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-speede-black/30"
                    >
                      {isRot ? 'Clear All Logs' : isTh ? 'ล้างการแจ้งเตือนทั้งหมด' : 'Clear All'}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button 
            size="sm" 
            className="hidden lg:flex items-center gap-2 bg-red-500 text-white border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-white" />
            {isRot ? 'Get App no cap' : isTh ? 'โหลดแอป' : 'Download App'}
          </Button>

          {user ? (
            <Link to="/profile" onClick={() => soundEffects.play('click', theme, language)} className="hidden sm:flex items-center space-x-3 ml-4 theme-panel rounded-full pl-4 pr-1.5 py-1.5 bg-white dark:bg-speede-darkGray">
              <span className="text-sm font-medium dark:text-white">{user.name}</span>
              <div className="w-10 h-10 rounded-full theme-panel overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 !shadow-none">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => {
              soundEffects.play('click', theme, language);
              showAuthModal();
            }} className="hidden sm:block ml-4">
              {isRot ? 'Identify Yourself' : isTh ? 'เข้าสู่ระบบ' : 'Sign in'}
            </Button>
          )}
          <Button size="sm" className="hidden sm:flex ml-2" onClick={() => {
            soundEffects.play('click', theme, language);
            if (!user) showAuthModal();
            else navigate('/post-job');
          }}>
            {isRot ? 'Drop a Quest' : isTh ? 'ลงประกาศงาน' : 'Post a Job'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {selectedApplication && (
          <ReviewApplicationModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEasterEgg && (
          <InvincibleEasterEgg onClose={() => setShowEasterEgg(false)} />
        )}
      </AnimatePresence>

      <UserSearchModal 
        isOpen={showUserSearchModal} 
        onClose={() => setShowUserSearchModal(false)} 
      />
    </header>
  );
}
