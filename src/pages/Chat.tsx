import { useState, useEffect } from 'react';
import { Send, Info, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useSettings } from '@/contexts/SettingsContext';
import { clsx } from 'clsx';
import { PageTransition } from '@/components/ui/PageTransition';
import { useLocation } from 'react-router-dom';
import { soundEffects } from '@/lib/soundEffects';
import { useAuth, User } from '@/contexts/AuthContext';

export default function Chat() { 
  const { theme, language } = useSettings();
  const { user } = useAuth();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';
  
  const location = useLocation();
  const startChatWith = location.state?.startChatWith as User | undefined;

  const [activeTab, setActiveTab] = useState<'inbox' | 'requests'>('inbox');
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

  const inboxChats = groupedChats.filter(c => !c.isRequest);
  const requestsChats = groupedChats.filter(c => c.isRequest);

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
                "flex-1 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-1.5"
              )}
              style={{
                backgroundColor: activeTab === 'inbox' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'inbox' ? 'var(--theme-text)' : 'var(--theme-text-muted)'
              }}
            >
              {isRot ? 'Main' : isTh ? 'กล่องข้อความ' : 'Inbox'}
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={clsx(
                "flex-1 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-1.5"
              )}
              style={{
                backgroundColor: activeTab === 'requests' ? 'var(--theme-surface)' : 'transparent',
                color: activeTab === 'requests' ? 'var(--theme-text)' : 'var(--theme-text-muted)'
              }}
            >
              <span>{isRot ? 'Sus' : isTh ? 'คำขอ' : 'Requests'}</span>
              {requestsChats.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-speede-red text-white rounded-full leading-none">
                  {requestsChats.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
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
            <button 
              onClick={() => setActiveChatEmail(null)}
              className="md:hidden p-2 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500"
            >
              Back
            </button>
          </div>
          
          {/* Messages */}
          <div className={clsx(
            "flex-1 overflow-y-auto p-4 space-y-4",
            displayedMessages.length === 0 && "flex flex-col items-center justify-center"
          )}>
            {displayedMessages.length > 0 ? (
              displayedMessages.map(m => (
                <div 
                  key={m.id} 
                  className={clsx(
                    "flex flex-col max-w-[70%] rounded-2xl p-3 border border-theme-border-color shrink-0", 
                    m.sender === 'me' ? "ml-auto" : "mr-auto"
                  )}
                  style={{
                    backgroundColor: m.sender === 'me' ? 'var(--theme-primary)' : 'var(--theme-secondary)',
                    color: m.sender === 'me' ? '#FFFFFF' : 'var(--theme-text)'
                  }}
                >
                  <p className="text-sm">{m.text}</p>
                  <span className="text-[10px] opacity-75 mt-1 self-end">{m.time}</span>
                </div>
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
    </PageTransition>
  );
}

