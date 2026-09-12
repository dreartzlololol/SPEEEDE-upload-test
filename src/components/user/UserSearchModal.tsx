import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, MessageSquare, Check, X, Star, Users, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { pushNotificationToUser } from '@/contexts/NotificationContext';
import { soundEffects } from '@/lib/soundEffects';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const { user, updateUser, showAuthModal } = useAuth();
  const { theme, language } = useSettings();
  const navigate = useNavigate();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddFriend = async (targetUser: User) => {
    if (!user) {
      showAuthModal();
      return;
    }

    soundEffects.play('click', theme, language);

    try {
      await pushNotificationToUser(
        targetUser.email,
        isTh ? 'คำขอเป็นเพื่อน 🤝' : 'Friend Request 🤝',
        isTh ? `${user.name} ส่งคำขอเป็นเพื่อนถึงคุณ` : `${user.name} sent you a friend request!`,
        'info',
        undefined,
        { type: 'friend_request', senderEmail: user.email, senderName: user.name }
      );

      setSentRequests(prev => [...prev, targetUser.email.toLowerCase()]);
      showToast(isTh ? `ส่งคำขอเป็นเพื่อนไปยัง ${targetUser.name} แล้ว!` : `Friend request sent to ${targetUser.name}!`);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleStartMessage = (targetUser: User) => {
    if (!user) {
      showAuthModal();
      return;
    }
    soundEffects.play('click', theme, language);
    onClose();
    navigate('/chat', { state: { startChatWith: targetUser } });
  };

  const filteredUsers = allUsers.filter(u => {
    if (user && u.email.toLowerCase() === user.email.toLowerCase()) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-xl bg-white dark:bg-speede-darkGray rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-speede-black/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 flex items-center justify-center text-theme-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white leading-tight">
                  {isRot ? 'Find Homies & Ops 🔍' : isTh ? 'ค้นหาบัญชีและเพื่อน' : 'Find Accounts & Friends'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isRot ? 'Search registered accounts & yap together' : isTh ? 'ค้นหาผู้ใช้งานอื่นเพื่อเพิ่มเป็นเพื่อนและส่งข้อความ' : 'Search registered users to add as friends & message'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-speede-black rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={isRot ? "Type account name or email..." : isTh ? "พิมพ์ชื่อ หรือ อีเมล เพื่อค้นหา..." : "Search by name or email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-speede-black rounded-2xl text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary"
                autoFocus
              />
            </div>
          </div>

          {/* User Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {isTh ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'No user accounts found matching search.'}
              </div>
            ) : (
              filteredUsers.map((u) => {
                const userFriends = user?.friends || [];
                const isFriend = userFriends.includes(u.email.toLowerCase());
                const isRequestSent = sentRequests.includes(u.email.toLowerCase());

                return (
                  <motion.div
                    key={u.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-gray-50/80 dark:bg-speede-black/50 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-theme-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-speede-darkGray"></div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm dark:text-white truncate">{u.name}</h4>
                          <div className="flex items-center text-yellow-500 text-xs shrink-0">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="ml-0.5 font-semibold">{u.rating || 5.0}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartMessage(u)}
                        className="p-2.5 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title={isTh ? 'แชท' : 'Message'}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">{isTh ? 'ส่งข้อความ' : 'Message'}</span>
                      </button>

                      {isFriend ? (
                        <div className="px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1">
                          <UserCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">{isTh ? 'เป็นเพื่อนแล้ว' : 'Friends'}</span>
                        </div>
                      ) : isRequestSent ? (
                        <div className="px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">{isTh ? 'ส่งแล้ว' : 'Sent'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(u)}
                          className="px-3 py-2 bg-theme-primary text-white hover:brightness-110 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">{isTh ? 'เพิ่มเพื่อน' : 'Add Friend'}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Toast Alert */}
          {toastMsg && (
            <div className="p-3 bg-speede-black text-white text-center text-xs font-bold border-t border-gray-800">
              {toastMsg}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
