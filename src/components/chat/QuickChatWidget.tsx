import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export function QuickChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    { sender: 'ai', text: 'Hi! Looking for fast local jobs or need help finding an assignment near you?', time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useSettings();
  const isTh = language === 'th';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeNow }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = isTh 
        ? 'ขออภัย ขณะนี้ทีมงานกำลังตรวจสอบคำถามของคุณ สามารถดูรายละเอียดเพิ่มเติมได้ที่หน้าค้นหากลุ่มงาน' 
        : 'Got it! I matched 3 top urgent jobs near your radius. Check the Feed or Map view!';

      if (userMsg.toLowerCase().includes('job') || userMsg.toLowerCase().includes('work') || userMsg.toLowerCase().includes('งาน')) {
        replyText = isTh ? 'คุณสามารถกดดูงานล่าสุดได้ที่หน้า Feed หรือ Map view เลย!' : 'You can explore all instant job opportunities in the Feed or Map tab right now!';
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="mb-4 w-80 sm:w-96 h-96 bg-white dark:bg-speede-darkGray rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Widget Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none">Speede Assistant</h4>
                  <span className="text-[10px] text-blue-100 font-medium">Instant AI & Community Support</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setIsOpen(false); navigate('/chat'); }}
                  className="p-1 hover:bg-white/20 rounded-full text-white transition-colors"
                  title="Open Full Chat"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-speede-black/30">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs ${
                    m.sender === 'user'
                      ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                      : 'mr-auto bg-white dark:bg-speede-black dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`text-[9px] mt-1 self-end ${m.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {m.time}
                  </span>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mr-auto bg-white dark:bg-speede-black p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-xs text-gray-400 shadow-sm"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions & Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-speede-darkGray flex gap-2">
              <input
                type="text"
                placeholder={isTh ? "พิมพ์คำถามชั่วคราว..." : "Ask something..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-100 dark:bg-speede-black px-4 py-2 rounded-full text-xs text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl border border-blue-400 flex items-center justify-center relative group"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
