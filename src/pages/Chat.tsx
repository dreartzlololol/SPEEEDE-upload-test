import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, Info, Search, MoreVertical, UserPlus, Flag, BellOff, Slash, User as UserIcon, X, Tag, MessageSquare, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { useSettings } from '@/contexts/SettingsContext';
import { clsx } from 'clsx';
import { PageTransition } from '@/components/ui/PageTransition';
import { useLocation } from 'react-router-dom';
import { soundEffects } from '@/lib/soundEffects';
import { pushNotificationToUser } from '@/contexts/NotificationContext';
import { useAuth, User } from '@/contexts/AuthContext';

export default function Chat() { 
  const { theme, language } = useSettings();
  const { user, updateUser } = useAuth();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  
  const location = useLocation();
  const startChatWith = location.state?.startChatWith as User | undefined;

  const [activeTab, setActiveTab] = useState<'inbox' | 'requests' | 'friends'>('inbox');
  const [selectedFriendTag, setSelectedFriendTag] = useState<string>('All');
  const [showTagModal, setShowTagModal] = useState(false);
  const [taggingFriendEmail, setTaggingFriendEmail] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [activeChatEmail, setActiveChatEmail] = useState<string | null>(startChatWith ? startChatWith.email : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data);
        }
      } catch (err) {
        console.error('Error fetching all users:', err);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?email=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setDbMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval); 
  }, [user]);

  interface ChatItem {
    id: number;
    email: string;
    name: string;
    avatar: string;
    online: boolean;
    time: string;
    lastMessage: string;
    unread: number;
    isRequest: boolean;
  }

  const getOtherUserProfile = (otherEmail: string) => {
    const found = allUsers.find(u => u.email.toLowerCase() === otherEmail.toLowerCase());
    return {
      name: found?.name || otherEmail.split('@')[0],
      avatar: found?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherEmail}`,
      online: true, // Default to true to show online status indicators in this community simulation
      email: otherEmail
    };
  };

  // Group messages by conversation
  const groupedChats: ChatItem[] = [];
  const processedEmails = new Set<string>();

  if (user) {
    dbMessages.forEach(m => {
      const otherEmail = m.senderEmail.toLowerCase() === user.email.toLowerCase() 
        ? m.receiverEmail 
        : m.senderEmail;
      
      const otherEmailKey = otherEmail.toLowerCase();
      if (processedEmails.has(otherEmailKey)) return;
      processedEmails.add(otherEmailKey);

      const conversation = dbMessages.filter(msg => 
        (msg.senderEmail.toLowerCase() === user.email.toLowerCase() && msg.receiverEmail.toLowerCase() === otherEmailKey) ||
        (msg.senderEmail.toLowerCase() === otherEmailKey && msg.receiverEmail.toLowerCase() === user.email.toLowerCase())
      ).sort((a, b) => a.id - b.id);

      const lastMsg = conversation[conversation.length - 1];
      const otherProfile = getOtherUserProfile(otherEmailKey);

      // It is a request if it is not accepted and the last message was sent by them (so we are the receiver of the pending request)
      const isRequest = !lastMsg.isAccepted && (lastMsg.receiverEmail.toLowerCase() === user.email.toLowerCase());

      groupedChats.push({
        id: lastMsg.id,
        email: otherEmailKey,
        name: otherProfile.name,
        avatar: otherProfile.avatar,
        online: otherProfile.online,
        time: new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastMessage: lastMsg.text,
        unread: 0,
        isRequest
      });
    });
  }

  // Sort conversations by most recent message
  groupedChats.sort((a, b) => b.id - a.id);

  // Prepend new startChatWith if no messages exist yet
  if (startChatWith && !processedEmails.has(startChatWith.email.toLowerCase())) {
    groupedChats.unshift({
      id: Date.now() + 100000,
      email: startChatWith.email.toLowerCase(),
      name: startChatWith.name,
      avatar: startChatWith.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${startChatWith.name}`,
      online: true,
      time: 'Now',
      lastMessage: isRot ? 'Start yapping fr...' : isTh ? 'พิมพ์ข้อความเพื่อเริ่มสนทนา...' : 'Start a conversation...',
      unread: 0,
      isRequest: false
    });
  }

  const inboxChats = groupedChats.filter(c => !c.isRequest && !blockedUsers.includes(c.email.toLowerCase()));
  const requestsChats = groupedChats.filter(c => c.isRequest && !blockedUsers.includes(c.email.toLowerCase()));

  const currentChats = activeTab === 'inbox' ? inboxChats : requestsChats;
  const filteredChats = currentChats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedChatProfile = activeChatEmail ? getOtherUserProfile(activeChatEmail) : null;

  const currentMessages = user && activeChatEmail
    ? dbMessages.filter(m => 
        (m.senderEmail.toLowerCase() === user.email.toLowerCase() && m.receiverEmail.toLowerCase() === activeChatEmail.toLowerCase()) ||
        (m.senderEmail.toLowerCase() === activeChatEmail.toLowerCase() && m.receiverEmail.toLowerCase() === user.email.toLowerCase())
      ).sort((a, b) => a.id - b.id)
    : [];

  const displayedMessages = currentMessages.length > 0 
    ? currentMessages.map(m => ({
        id: m.id,
        sender: m.senderEmail.toLowerCase() === user?.email.toLowerCase() ? 'me' : 'them',
        text: m.text,
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChatEmail) return;
    
    const sentText = newMessage.trim();
    setNewMessage('');
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: user.email,
          receiverEmail: activeChatEmail,
          text: sentText
        })
      });
      if (response.ok) {
        const newMsg = await response.json();
        setDbMessages(prev => [...prev, newMsg]);
        soundEffects.play('message', theme, language);
        
        // If we replied to a request, move active tab to inbox
        if (activeTab === 'requests') {
          setActiveTab('inbox');
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getFullUserProfile = (otherEmail: string) => {
    return allUsers.find(u => u.email.toLowerCase() === otherEmail.toLowerCase());
  };

  const activeFullProfile = activeChatEmail ? getFullUserProfile(activeChatEmail) : null;
  const profileToDisplay = activeFullProfile || {
    name: selectedChatProfile?.name || 'User',
    email: activeChatEmail || '',
    avatar: selectedChatProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChatProfile?.name}`,
    bio: isRot ? 'No lore provided fr.' : isTh ? 'ยังไม่มีข้อมูลแนะนำตัว' : 'No bio provided.',
    rating: 5.0,
    completedJobs: 0,
    skills: []
  };

  const handleToggleFriend = async () => {
    if (!selectedChatProfile || !user) return;
    const email = selectedChatProfile.email.toLowerCase();
    
    const currentFriends = user.friends || [];
    if (currentFriends.includes(email)) {
      // Remove friend
      const updatedFriends = currentFriends.filter(e => e !== email);
      await updateUser({ friends: updatedFriends });
      
      // Also update the other user's friends list
      const resUsers = await fetch('/api/users', { headers: { 'bypass-tunnel-reminder': 'true' } });
      if (resUsers.ok) {
        const users: User[] = await resUsers.json();
        const otherUser = users.find(u => u.email.toLowerCase() === email);
        const otherFriends = otherUser?.friends || [];
        if (otherFriends.includes(user.email)) {
          await fetch('/api/auth/update', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'bypass-tunnel-reminder': 'true'
            },
            body: JSON.stringify({ 
              email: email, 
              updates: { friends: otherFriends.filter(e => e !== user.email) } 
            })
          });
        }
      }
      
      triggerToast(isTh ? `ลบ ${selectedChatProfile.name} ออกจากเพื่อนแล้ว` : isRot ? `Removed ${selectedChatProfile.name} from friend list.` : `Removed ${selectedChatProfile.name} from friends.`);
    } else {
      // Send Friend Request
      await pushNotificationToUser(
        email,
        isTh ? 'คำขอเป็นเพื่อน 🤝' : 'Friend Request 🤝',
        isTh ? `${user.name} ส่งคำขอเป็นเพื่อนถึงคุณ` : `${user.name} sent you a friend request!`,
        'info',
        undefined,
        { type: 'friend_request', senderEmail: user.email, senderName: user.name }
      );
      
      triggerToast(isTh ? `ส่งคำขอเป็นเพื่อนไปยัง ${selectedChatProfile.name} แล้ว` : isRot ? `Sent friend request to ${selectedChatProfile.name}!` : `Sent friend request to ${selectedChatProfile.name}!`);
    }
    setShowSettingsMenu(false);
  };

  const handleToggleMute = () => {
    if (!selectedChatProfile) return;
    const email = selectedChatProfile.email.toLowerCase();
    if (mutedUsers.includes(email)) {
      setMutedUsers(prev => prev.filter(e => e !== email));
      triggerToast(isTh ? `เปิดการแจ้งเตือนสำหรับ ${selectedChatProfile.name}` : isRot ? `Unmuted ${selectedChatProfile.name}.` : `Unmuted notifications for ${selectedChatProfile.name}.`);
    } else {
      setMutedUsers(prev => [...prev, email]);
      triggerToast(isTh ? `ปิดการแจ้งเตือนสำหรับ ${selectedChatProfile.name}` : isRot ? `Muted ${selectedChatProfile.name}.` : `Muted notifications for ${selectedChatProfile.name}.`);
    }
    setShowSettingsMenu(false);
  };

  const handleBlockUser = () => {
    if (!selectedChatProfile) return;
    const email = selectedChatProfile.email.toLowerCase();
    setBlockedUsers(prev => [...prev, email]);
    triggerToast(isTh ? `บล็อกผู้ใช้ ${selectedChatProfile.name} แล้ว` : isRot ? `Blocked ${selectedChatProfile.name} fr.` : `Blocked ${selectedChatProfile.name}.`);
    setActiveChatEmail(null); // Close chat
    setShowSettingsMenu(false);
  };

  const handleReportUser = () => {
    setShowReportModal(true);
    setShowSettingsMenu(false);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
    setShowSettingsMenu(false);
  };

  const handleAddTag = async (email: string, tag: string) => {
    if (!user || !tag.trim()) return;
    const currentTags = user.friendTags || {};
    const friendEmailKey = email.toLowerCase();
    const userTags = currentTags[friendEmailKey] || [];
    if (!userTags.includes(tag.trim())) {
      const updatedTags = {
        ...currentTags,
        [friendEmailKey]: [...userTags, tag.trim()]
      };
      await updateUser({ friendTags: updatedTags });
      triggerToast(isTh ? `เพิ่มกลุ่ม/แท็ก "${tag.trim()}" เรียบร้อย` : isRot ? `Added tag "${tag.trim()}" fr.` : `Added tag "${tag.trim()}" successfully.`);
    }
  };

  const handleRemoveTag = async (email: string, tagToRemove: string) => {
    if (!user) return;
    const currentTags = user.friendTags || {};
    const friendEmailKey = email.toLowerCase();
    const userTags = currentTags[friendEmailKey] || [];
    const updatedTags = {
      ...currentTags,
      [friendEmailKey]: userTags.filter(t => t !== tagToRemove)
    };
    await updateUser({ friendTags: updatedTags });
    triggerToast(isTh ? `ลบแท็ก "${tagToRemove}" แล้ว` : isRot ? `Removed tag "${tagToRemove}".` : `Removed tag "${tagToRemove}".`);
  };

  return (
    <PageTransition className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex theme-panel overflow-hidden">
      
      {/* Sidebar */}
      <div className={clsx(
        "w-full md:w-80 lg:w-96 flex flex-col border-r border-theme-border-color/20 shrink-0",
        activeChatEmail !== null ? "hidden md:flex" : "flex"
      )} style={{ backgroundColor: 'var(--theme-surface)' }}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-2xl font-bold dark:text-white">
            {isRot ? 'DMs' : isTh ? 'ข้อความ' : 'Messages'}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder={isRot ? "Find your homies..." : isTh ? "ค้นหา..." : "Search..."}
              className="pl-9 bg-gray-50 dark:bg-speede-black/50 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 rounded-full border border-theme-border-color/20" style={{ backgroundColor: 'var(--theme-bg)' }}>
            <button 
              onClick={() => setActiveTab('inbox')}
              className={clsx(
                "flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-1"
              )}
              style={{
                backgroundColor: activeTab === 'inbox' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'inbox' ? 'var(--theme-text)' : 'var(--theme-text-muted)'
              }}
            >
              {isRot ? 'Main' : isTh ? 'กล่องข้อความ' : 'Inbox'}
            </button>
            <button 
              onClick={() => { setActiveTab('requests'); setSelectedFriendTag('All'); }}
              className={clsx(
                "flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-1"
              )}
              style={{
                backgroundColor: activeTab === 'requests' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'requests' ? 'var(--theme-text)' : 'var(--theme-text-muted)'
              }}
            >
              <span>{isRot ? 'Sus' : isTh ? 'คำขอ' : 'Requests'}</span>
              {requestsChats.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-speede-red text-white rounded-full leading-none">
                  {requestsChats.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('friends'); setSelectedFriendTag('All'); }}
              className={clsx(
                "flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-1"
              )}
              style={{
                backgroundColor: activeTab === 'friends' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'friends' ? 'var(--theme-text)' : 'var(--theme-text-muted)'
              }}
            >
              <span>{isRot ? 'Homies' : isTh ? 'เพื่อน' : 'Friends'}</span>
              {user?.friends && user.friends.length > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-theme-primary/25 text-theme-primary rounded-full leading-none border border-theme-primary/10">
                  {user.friends.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tag Filters for Friends Tab */}
        {activeTab === 'friends' && (
          <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 border-b border-theme-border-color/10 bg-gray-50/50 dark:bg-speede-black/20 shrink-0 scrollbar-hide">
            {['All', ...Array.from(new Set(Object.values(user?.friendTags || {}).flat()))].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedFriendTag(tag)}
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                  selectedFriendTag === tag 
                    ? "bg-theme-primary border-theme-primary text-white" 
                    : "bg-white dark:bg-speede-black border-theme-border-color/20 text-theme-text-muted hover:bg-gray-50 dark:hover:bg-speede-black/70"
                )}
              >
                {tag === 'All' ? (isTh ? 'ทั้งหมด' : 'All') : tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'friends' ? (
            (() => {
              const friendEmails = user?.friends || [];
              const friendProfiles = friendEmails.map(email => {
                const prof = getFullUserProfile(email);
                return prof || {
                  name: email.split('@')[0],
                  email: email,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                  online: false,
                  bio: '',
                  rating: 5.0,
                  completedJobs: 0,
                  skills: []
                };
              });
              const filteredFriends = friendProfiles.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.email.toLowerCase().includes(searchQuery.toLowerCase())
              );
              const friendTagsMap = user?.friendTags || {};
              const activeFriends = filteredFriends.filter(friend => {
                if (selectedFriendTag === 'All') return true;
                const tags = friendTagsMap[friend.email.toLowerCase()] || [];
                return tags.includes(selectedFriendTag);
              });

              if (activeFriends.length === 0) {
                return (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-speede-black rounded-full flex items-center justify-center mb-4">
                      <Tag className="w-8 h-8 opacity-50" />
                    </div>
                    <p>{isTh ? 'ไม่พบเพื่อนตามข้อมูลที่ค้นหา' : 'No friends found.'}</p>
                  </div>
                );
              }

              return activeFriends.map(friend => {
                const tags = friendTagsMap[friend.email.toLowerCase()] || [];
                return (
                  <div 
                    key={friend.email}
                    onClick={() => setActiveChatEmail(friend.email)}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-theme-secondary/20 transition-colors border-b border-theme-border-color/10"
                    style={{
                      backgroundColor: activeChatEmail === friend.email ? 'var(--theme-secondary)' : 'transparent'
                    }}
                  >
                    <div className="relative shrink-0">
                      <img src={friend.avatar} className="w-12 h-12 rounded-full bg-gray-100" alt={friend.name} />
                      {(friend as any).online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-speede-darkGray"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate text-theme-text">{friend.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.length > 0 ? (
                          tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-theme-primary/10 text-theme-primary text-[10px] font-bold rounded-md border border-theme-primary/10">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">{isTh ? 'ไม่มีกลุ่ม' : 'Untagged'}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveChatEmail(friend.email)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-speede-black text-gray-500 hover:text-theme-primary rounded-lg transition-colors"
                        title={isTh ? 'แชท' : 'Chat'}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTaggingFriendEmail(friend.email);
                          setShowTagModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-speede-black text-gray-500 hover:text-blue-500 rounded-lg transition-colors"
                        title={isTh ? 'จัดการแท็ก/กลุ่ม' : 'Manage Tags'}
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!user) return;
                          if (confirm(isTh ? `คุณแน่ใจหรือไม่ที่จะลบ ${friend.name} ออกจากเพื่อน?` : `Are you sure you want to remove ${friend.name} from friends?`)) {
                            const currentFriends = user.friends || [];
                            const updatedFriends = currentFriends.filter(e => e !== friend.email.toLowerCase());
                            await updateUser({ friends: updatedFriends });
                            
                            const resUsers = await fetch('/api/users', { headers: { 'bypass-tunnel-reminder': 'true' } });
                            if (resUsers.ok) {
                              const users: User[] = await resUsers.json();
                              const otherUser = users.find(u => u.email.toLowerCase() === friend.email.toLowerCase());
                              const otherFriends = otherUser?.friends || [];
                              if (otherFriends.includes(user.email)) {
                                await fetch('/api/auth/update', {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'bypass-tunnel-reminder': 'true'
                                  },
                                  body: JSON.stringify({ 
                                    email: friend.email, 
                                    updates: { friends: otherFriends.filter(e => e !== user.email) } 
                                  })
                                });
                              }
                            }
                            if (activeChatEmail === friend.email) {
                              setActiveChatEmail(null);
                            }
                            triggerToast(isTh ? `ลบ ${friend.name} ออกจากเพื่อนแล้ว` : `Removed ${friend.name} from friends.`);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-speede-black text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                        title={isTh ? 'ลบเพื่อน' : 'Unfriend'}
                      >
                        <Slash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()
          ) : filteredChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-speede-black rounded-full flex items-center justify-center mb-4">
                <Info className="w-8 h-8 opacity-50" />
              </div>
              <p>{isRot ? 'No unread yap.' : isTh ? 'ไม่มีข้อความ' : 'No messages here.'}</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat.email}
                onClick={() => setActiveChatEmail(chat.email)}
                className="flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-theme-border-color/10"
                style={{
                  backgroundColor: activeChatEmail === chat.email ? 'var(--theme-secondary)' : 'transparent'
                }}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} className="w-12 h-12 rounded-full bg-gray-100" alt={chat.name} />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-speede-darkGray"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold truncate" style={{ color: 'var(--theme-text)' }}>{chat.name}</h4>
                    <span className="text-xs whitespace-nowrap ml-2" style={{ color: 'var(--theme-text-muted)' }}>{chat.time}</span>
                  </div>
                  <p className="text-sm truncate" style={{ color: 'var(--theme-text-muted)' }}>{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-speede-red text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatEmail !== null ? (
        <div className="flex-1 flex flex-col border-l border-theme-border-color/20" style={{ backgroundColor: 'var(--theme-surface)' }}>
          {/* Header */}
          <div className="p-4 border-b border-theme-border-color/20 flex items-center justify-between" style={{ backgroundColor: 'var(--theme-surface)' }}>
            <div className="flex items-center gap-3">
              <img src={selectedChatProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChatProfile?.name}`} className="w-10 h-10 rounded-full bg-gray-100" />
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--theme-text)' }}>{selectedChatProfile?.name || 'User'}</h4>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative" ref={settingsMenuRef}>
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-speede-black rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                aria-label="Settings"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showSettingsMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-speede-darkGray border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleViewProfile}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-speede-black text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        {isRot ? 'View Stats (Profile)' : isTh ? 'ดูโปรไฟล์' : 'View Profile'}
                      </button>
                      
                      <button
                        onClick={handleToggleFriend}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-speede-black text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        {(user?.friends || []).includes(activeChatEmail?.toLowerCase() || '') 
                          ? (isRot ? 'Unfriend 💔' : isTh ? 'ลบเพื่อน' : 'Remove Friend')
                          : (isRot ? 'Add Homie 🤝' : isTh ? 'เพิ่มเพื่อน' : 'Add as Friend')
                        }
                      </button>

                      <button
                        onClick={handleToggleMute}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-speede-black text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
                      >
                        <BellOff className="w-4 h-4 text-gray-400" />
                        {mutedUsers.includes(activeChatEmail?.toLowerCase() || '')
                          ? (isRot ? 'Unmute Pings' : isTh ? 'เปิดการแจ้งเตือน' : 'Unmute Notifications')
                          : (isRot ? 'Mute Pings' : isTh ? 'ปิดการแจ้งเตือน' : 'Mute Notifications')
                        }
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleBlockUser}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-speede-black text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors font-medium"
                      >
                        <Slash className="w-4 h-4 text-red-500" />
                        {isRot ? 'Block fr 🚫' : isTh ? 'บล็อกผู้ใช้' : 'Block User'}
                      </button>
                      <button
                        onClick={handleReportUser}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-speede-black text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors font-medium"
                      >
                        <Flag className="w-4 h-4 text-red-500" />
                        {isRot ? 'Report Sus 🚨' : isTh ? 'รายงานผู้ใช้' : 'Report User'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back Button (Mobile) */}
              <button 
                onClick={() => setActiveChatEmail(null)}
                className="md:hidden p-2 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500"
              >
                Back
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className={clsx(
            "flex-1 overflow-y-auto p-4 space-y-4",
            displayedMessages.length === 0 && "flex flex-col items-center justify-center"
          )}>
            {displayedMessages.length > 0 ? (
              displayedMessages.map((m, index) => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25, delay: Math.min(index * 0.03, 0.3) }}
                  className={clsx(
                    "flex flex-col max-w-[70%] rounded-2xl p-3 border border-theme-border-color shrink-0 shadow-sm", 
                    m.sender === 'me' ? "ml-auto rounded-br-xs" : "mr-auto rounded-bl-xs"
                  )}
                  style={{
                    backgroundColor: m.sender === 'me' ? 'var(--theme-primary)' : 'var(--theme-secondary)',
                    color: m.sender === 'me' ? '#FFFFFF' : 'var(--theme-text)'
                  }}
                >
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <span className="text-[10px] opacity-75 mt-1 self-end">{m.time}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto border-2 border-theme-border-color shadow-sm">
                  <Send className="w-6 h-6 text-speede-red" />
                </div>
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300">
                    {isRot ? 'No yap history yet 💀' : isTh ? 'ยังไม่มีประวัติการสนทนา' : 'No chat history yet'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    {isRot ? 'Send a message to start yapping no cap!' : isTh ? 'ส่งข้อความเพื่อเริ่มสนทนาเกี่ยวกับงาน!' : 'Send a message to start talking about the job!'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-theme-border-color/20 flex gap-2" style={{ backgroundColor: 'var(--theme-surface)' }}>
            <Input 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={isRot ? "Type your yap..." : isTh ? "พิมพ์ข้อความ..." : "Type a message..."}
              className="flex-1"
            />
            <button 
              type="submit" 
              className="p-3 text-white rounded-xl flex items-center justify-center border-2 border-theme-border-color"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-speede-black/50">
          <div className="w-20 h-20 bg-white dark:bg-speede-darkGray rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <Send className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">
            {isRot ? 'Select a homie to yap with' : isTh ? 'เลือกข้อความเพื่อเริ่มสนทนา' : 'Select a message to start chatting'}
          </h3>
        </div>
      )}

      {/* Toast Message */}
      {createPortal(
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-speede-black text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium z-[110] border border-white/10"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Report Modal */}
      {createPortal(
        <AnimatePresence>
          {showReportModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-speede-darkGray p-6 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-lg font-bold mb-4 dark:text-white">
                  {isRot ? 'Report User 🚨' : isTh ? 'รายงานผู้ใช้' : 'Report User'}
                </h3>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={isRot ? "Why are they capping or being sus..." : isTh ? "ระบุเหตุผลในการรายงาน..." : "Tell us why you are reporting this user..."}
                  className="w-full p-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-speede-black rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-speede-red min-h-[100px] mb-4 dark:text-white"
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setShowReportModal(false); setReportReason(''); }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-speede-black text-gray-500"
                  >
                    {isRot ? 'Cancel' : isTh ? 'ยกเลิก' : 'Cancel'}
                  </button>
                  <button 
                    onClick={() => {
                      if (reportReason.trim()) {
                        triggerToast(isTh ? 'รายงานผู้ใช้สำเร็จ ขอบคุณที่แจ้งข้อมูล!' : isRot ? 'Reported! Thanks for keeping it clean fr.' : 'Report submitted! Thank you.');
                        setShowReportModal(false);
                        setReportReason('');
                      }
                    }}
                    className="flex-1 py-2 bg-speede-red text-white rounded-xl text-sm font-bold shadow-md shadow-speede-red/25"
                  >
                    {isRot ? 'Submit' : isTh ? 'ส่งรายงาน' : 'Submit'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Profile Modal */}
      {createPortal(
        <AnimatePresence>
          {showProfileModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-speede-darkGray p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden"
              >
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-1.5 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-theme-border-color"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-theme-border-color overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <img src={profileToDisplay.avatar} alt={profileToDisplay.name} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-xl font-bold dark:text-white mb-1">{profileToDisplay.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{profileToDisplay.email}</p>
                
                {/* Ratings and Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 dark:bg-speede-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Rating</span>
                    <span className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-1">
                      ★ {profileToDisplay.rating}
                    </span>
                  </div>
                  <div className="text-center border-l border-gray-200 dark:border-gray-800">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Completed</span>
                    <span className="text-lg font-bold dark:text-white text-theme-primary">
                      {profileToDisplay.completedJobs} {isTh ? 'งาน' : 'jobs'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="text-left mb-6">
                  <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Bio</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-speede-black/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed">
                    "{profileToDisplay.bio}"
                  </p>
                </div>

                {/* Skills */}
                {profileToDisplay.skills && profileToDisplay.skills.length > 0 && (
                  <div className="text-left mb-6">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profileToDisplay.skills.map((skill: string) => (
                        <span key={skill} className="px-2.5 py-1 bg-speede-red/10 text-speede-red text-xs font-bold rounded-full border border-speede-red/15">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-3 bg-speede-black text-white dark:bg-white dark:text-speede-black rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Manage Tags Modal */}
      {createPortal(
        <AnimatePresence>
          {showTagModal && taggingFriendEmail && (
            (() => {
              const friendProfile = getFullUserProfile(taggingFriendEmail) || { name: taggingFriendEmail.split('@')[0] };
              const currentTags = (user?.friendTags || {})[taggingFriendEmail.toLowerCase()] || [];
              
              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-speede-darkGray p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 relative"
                  >
                    <button 
                      onClick={() => { setShowTagModal(false); setTaggingFriendEmail(null); setNewTagInput(''); }}
                      className="absolute top-4 right-4 p-1.5 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-theme-border-color"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <h3 className="text-lg font-bold mb-1 dark:text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-theme-primary" />
                      {isTh ? 'จัดการแท็ก/กลุ่ม' : 'Manage Tags'}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {isTh ? `จัดกลุ่มสำหรับ ${friendProfile.name}` : `Organize tags for ${friendProfile.name}`}
                    </p>

                    {/* Current Tags */}
                    <div className="mb-4">
                      <span className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">
                        {isTh ? 'กลุ่มปัจจุบัน' : 'Current Tags'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-gray-50 dark:bg-speede-black rounded-xl border border-theme-border-color/10">
                        {currentTags.length > 0 ? (
                          currentTags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2.5 py-1 bg-theme-primary/10 text-theme-primary text-xs font-bold rounded-full border border-theme-primary/15 flex items-center gap-1"
                            >
                              {tag}
                              <button 
                                onClick={() => handleRemoveTag(taggingFriendEmail, tag)}
                                className="hover:text-speede-red transition-colors ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 self-center italic px-1">
                            {isTh ? 'ยังไม่มีกลุ่ม/แท็ก' : 'No tags assigned yet.'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add Tag Input */}
                    <div className="space-y-2 mb-4">
                      <span className="block text-xs text-gray-400 font-bold uppercase tracking-wide">
                        {isTh ? 'เพิ่มแท็กใหม่' : 'Add New Tag'}
                      </span>
                      <div className="flex gap-2">
                        <Input
                          value={newTagInput}
                          onChange={e => setNewTagInput(e.target.value)}
                          placeholder={isTh ? "พิมพ์ชื่อแท็ก..." : "Type tag name..."}
                          className="flex-1 text-sm h-10 rounded-xl"
                        />
                        <button
                          onClick={() => {
                            if (newTagInput.trim()) {
                              handleAddTag(taggingFriendEmail, newTagInput.trim());
                              setNewTagInput('');
                            }
                          }}
                          className="px-3 bg-theme-primary text-white rounded-xl flex items-center justify-center font-bold text-sm h-10 hover:opacity-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Add Suggestions */}
                    <div>
                      <span className="block text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">
                        {isTh ? 'กลุ่มแนะนำ' : 'Suggestions'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[(isTh ? 'คนโปรด' : 'Favorites'), (isTh ? 'งาน' : 'Work'), (isTh ? 'ด่วน' : 'Urgent'), (isTh ? 'ครอบครัว' : 'Family')].map(tag => (
                          <button
                            key={tag}
                            disabled={currentTags.includes(tag)}
                            onClick={() => handleAddTag(taggingFriendEmail, tag)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-250 dark:bg-speede-black dark:hover:bg-speede-black/80 dark:text-gray-300 disabled:opacity-50 transition-colors border border-theme-border-color/10"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setShowTagModal(false); setTaggingFriendEmail(null); }}
                      className="w-full mt-6 py-3 bg-speede-black text-white dark:bg-white dark:text-speede-black rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      {isTh ? 'เสร็จสิ้น' : 'Done'}
                    </button>
                  </motion.div>
                </div>
              );
            })()
          )}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  );
}

