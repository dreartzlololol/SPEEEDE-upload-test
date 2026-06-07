import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/Input';
import { soundEffects } from '@/lib/soundEffects';

interface Message {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  text: string;
  timestamp: string;
  isAccepted: boolean;
}

interface WorkspaceChatProps {
  employerEmail: string;
  employerName: string;
}

export function WorkspaceChat({ employerEmail, employerName }: WorkspaceChatProps) {
  const { user } = useAuth();
  const { theme, language } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?email=${user.email}`, {
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter((m: Message) => 
            (m.senderEmail.toLowerCase() === user.email.toLowerCase() && m.receiverEmail.toLowerCase() === employerEmail.toLowerCase()) ||
            (m.senderEmail.toLowerCase() === employerEmail.toLowerCase() && m.receiverEmail.toLowerCase() === user.email.toLowerCase())
          );
          setMessages(filtered);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval); 
  }, [user, employerEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({
          senderEmail: user.email,
          receiverEmail: employerEmail,
          text: newMessage,
          isAccepted: true
        })
      });

      if (response.ok) {
        const sentMsg = await response.json();
        setMessages([...messages, sentMsg]);
        setNewMessage('');
        soundEffects.play('click', theme, language);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-speede-darkGray border-l border-gray-100 dark:border-gray-800 relative z-10">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-speede-red/5 dark:bg-speede-red/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-speede-red/10 flex items-center justify-center text-speede-red font-bold text-lg border-2 border-speede-red">
          {employerName[0]?.toUpperCase() || 'E'}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{employerName}</h2>
          <p className="text-xs text-green-500 font-medium">● Online (Workplace)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            {language === 'th' ? 'ไม่มีข้อความ' : 'No messages yet'}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail.toLowerCase() === user?.email.toLowerCase();
            return (
              <div key={msg.id} className={clsx("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                <div 
                  className={clsx(
                    "px-4 py-2 rounded-2xl",
                    isMe 
                      ? "bg-speede-red text-white rounded-br-sm" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-speede-darkGray border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
            className="flex-1 rounded-full bg-gray-50 dark:bg-gray-800 border-none px-4 shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-speede-red text-white flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95 shadow-md shadow-speede-red/20"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
