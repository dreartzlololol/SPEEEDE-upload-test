import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '@/contexts/TutorialContext';
import { useSettings, Language } from '@/contexts/SettingsContext';
import { Globe, Map, MessageSquare, Bell, ArrowRight, CheckCircle2, LayoutList, PlusCircle, User, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export function TutorialOverlay() {
  const { isActive, finishTutorial } = useTutorial();
  const { language, setLanguage } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();

  // Reset to step 0 when tutorial starts
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
    }
  }, [isActive]);
  
  // Need to update bounds if window resizes
  useEffect(() => {
    if (!isActive) return;
    
    const updateTarget = () => {
      const getTargetId = () => {
        const isDesktop = window.innerWidth >= 768;
        switch (currentStep) {
          case 1: return isDesktop ? 'tutorial-desktop-feed' : 'tutorial-nav-feed';
          case 2: return isDesktop ? 'tutorial-desktop-map' : 'tutorial-nav-map';
          case 3: return isDesktop ? 'tutorial-desktop-post' : 'tutorial-nav-post-job';
          case 4: return isDesktop ? 'tutorial-desktop-chat' : 'tutorial-nav-chat';
          case 5: return isDesktop ? 'tutorial-desktop-settings' : 'tutorial-nav-profile'; // Profile is where settings is on mobile
          case 6: return isDesktop ? 'tutorial-desktop-settings' : 'tutorial-nav-profile'; // Settings
          case 7: return 'tutorial-desktop-notifications'; // Always on Navbar
          default: return null;
        }
      };
      
      const id = getTargetId();
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
          return;
        }
      }
      setTargetRect(null);
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    // Add a small delay to allow UI to render first
    const timer = setTimeout(updateTarget, 100);
    return () => {
      window.removeEventListener('resize', updateTarget);
      clearTimeout(timer);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const tutorialSteps = [
    {
      id: 'language',
      title: { en: 'Welcome to SpeedE! 👋', th: 'ยินดีต้อนรับสู่ SpeedE! 👋', brainrot: 'Ayo welcome to SpeedE! 🥶' },
      desc: { en: 'First things first, what language do you prefer?', th: 'ก่อนอื่นเลย คุณต้องการใช้ภาษาอะไรครับ?', brainrot: 'Pick your vibe, what language we speaking?' },
      icon: Globe, color: 'bg-blue-500'
    },
    {
      id: 'feed',
      title: { en: 'Find Jobs Instantly 📋', th: 'ดูงานที่มีให้ทำตอนนี้ 📋', brainrot: 'Find Quests on the Feed 📋' },
      desc: { en: 'Browse the latest jobs on the Feed.', th: 'เลื่อนดูงานด่วนที่เปิดรับสมัครได้ที่หน้าฟีดเลย', brainrot: 'Check the feed to find quests.' },
      icon: LayoutList, color: 'bg-green-500'
    },
    {
      id: 'map',
      title: { en: 'Interactive Map 🗺️', th: 'แผนที่แบบ Interactive 🗺️', brainrot: 'The Ends 🗺️' },
      desc: { en: 'Find jobs near your location directly on the map.', th: 'หางานที่อยู่ใกล้ตัวคุณแบบเรียลไทม์ได้ง่ายๆ', brainrot: 'Locate quests near your spawn point.' },
      icon: Map, color: 'bg-emerald-500'
    },
    {
      id: 'post-job',
      title: { en: 'Post a Job 📝', th: 'ลงประกาศงาน 📝', brainrot: 'Drop a Quest 📝' },
      desc: { en: 'Need someone to help you? Post a job here.', th: 'ต้องการคนช่วยงานด่วน? ลงประกาศได้ที่นี่', brainrot: 'Need a squad? Drop your own quest here.' },
      icon: PlusCircle, color: 'bg-speede-red'
    },
    {
      id: 'chat',
      title: { en: 'Direct Chat 💬', th: 'แชทกับนายจ้าง/ผู้รับจ้าง 💬', brainrot: 'Yap Session 💬' },
      desc: { en: 'Communicate instantly with workers or employers.', th: 'พูดคุยตกลงรายละเอียดงานได้ทันทีผ่านระบบแชท', brainrot: 'Yap with your team or boss directly.' },
      icon: MessageSquare, color: 'bg-purple-500'
    },
    {
      id: 'profile',
      title: { en: 'Your Profile 👤', th: 'โปรไฟล์ของคุณ 👤', brainrot: 'Your Stats 👤' },
      desc: { en: 'Manage your applications, jobs, and resume.', th: 'จัดการเรซูเม่และตรวจสอบสถานะการสมัครงานของคุณ', brainrot: 'Check your stats and active quests.' },
      icon: User, color: 'bg-indigo-500'
    },
    {
      id: 'settings',
      title: { en: 'Settings ⚙️', th: 'การตั้งค่าแอป ⚙️', brainrot: 'Settings ⚙️' },
      desc: { en: 'Customize the theme, language, and notifications.', th: 'ปรับแต่งภาษา ธีมสีแอป และระบบการแจ้งเตือนต่างๆ', brainrot: 'Customize your looksmaxxing setup.' },
      icon: SettingsIcon, color: 'bg-gray-600'
    },
    {
      id: 'notifications',
      title: { en: 'Stay Updated 🔔', th: 'ไม่พลาดทุกความเคลื่อนไหว 🔔', brainrot: 'Stay Updated 🔔' },
      desc: { en: 'Receive real-time notifications when you get hired!', th: 'รับการแจ้งเตือนทันทีเมื่อมีคนรับคุณเข้าทำงาน!', brainrot: 'Get real-time pings when your quests get accepted.' },
      icon: Bell, color: 'bg-amber-500'
    }
  ];

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    // Navigate before incrementing step
    switch (currentStep) {
      case 0: navigate('/feed'); break;
      case 1: navigate('/map'); break;
      case 2: navigate('/post-job'); break;
      case 3: navigate('/chat'); break;
      case 4: navigate('/profile'); break;
      case 5: navigate('/settings'); break;
      case 6: navigate('/feed'); break; // return to feed for notifications
    }

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const setLangAndNext = (lang: Language) => {
    setLanguage(lang);
    handleNext();
  };

  // Determine popover position relative to target
  let popoverStyle: React.CSSProperties = {};
  if (targetRect) {
    const isMobile = window.innerWidth < 768;
    const isBottomNav = targetRect.top > window.innerHeight / 2;
    if (isBottomNav) {
      // Show above BottomNav
      popoverStyle = {
        bottom: `${window.innerHeight - targetRect.top + 20}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        margin: 0
      };
    } else {
      // Show below Navbar
      popoverStyle = {
        top: `${targetRect.bottom + 20}px`,
        left: isMobile ? '50%' : Math.min(Math.max(20, targetRect.left + targetRect.width / 2 - 160), window.innerWidth - 340) + 'px',
        transform: isMobile ? 'translateX(-50%)' : 'none',
        margin: 0
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* Background overlay with SVG Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        {targetRect && (
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect 
                x={targetRect.x - 10} 
                y={targetRect.y - 10} 
                width={targetRect.width + 20} 
                height={targetRect.height + 20} 
                rx="12" 
                fill="black" 
              />
            </mask>
          </defs>
        )}
        {/* Actual overlay that gets masked */}
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.4)" 
          mask={targetRect ? "url(#spotlight-mask)" : undefined} 
        />
        {/* Highlight Border */}
        {targetRect && (
          <rect 
            x={targetRect.x - 10} 
            y={targetRect.y - 10} 
            width={targetRect.width + 20} 
            height={targetRect.height + 20} 
            rx="12" 
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="8 4"
            className="animate-pulse"
          />
        )}
      </svg>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: targetRect ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={targetRect ? { position: 'absolute', ...popoverStyle } : {}}
          className={clsx(
            "bg-white dark:bg-speede-darkGray w-[92%] max-w-[340px] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden",
            !targetRect && "mx-auto mt-[15vh]"
          )}
        >
          {/* Progress Indicators */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2">
            {tutorialSteps.map((_, idx) => (
              <div 
                key={idx} 
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep ? "w-8 bg-speede-red" : "w-2 bg-gray-200 dark:bg-gray-700"
                )}
              />
            ))}
          </div>

          <div className="mt-6 mb-6 flex justify-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={clsx("w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/10", step.color)}
            >
              <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-gray-900 dark:text-white mb-3"
          >
            {step.title[language]}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed"
          >
            {step.desc[language]}
          </motion.p>

          {/* Action Area */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {step.id === 'language' ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => setLangAndNext('th')} className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-speede-red hover:bg-speede-red/5 font-bold transition-all text-gray-800 dark:text-gray-200">
                  🇹🇭 ภาษาไทย (แนะนำ)
                </button>
                <button onClick={() => setLangAndNext('en')} className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-blue-500 hover:bg-blue-500/5 font-bold transition-all text-gray-800 dark:text-gray-200">
                  🇬🇧 English
                </button>
                <button onClick={() => setLangAndNext('brainrot')} className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-purple-500 hover:bg-purple-500/5 font-bold transition-all text-gray-800 dark:text-gray-200">
                  💀 Gen Z / Brainrot
                </button>
              </div>
            ) : (
              <button 
                onClick={handleNext}
                className="w-full py-3 bg-speede-red text-white rounded-xl font-bold shadow-lg shadow-speede-red/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    {language === 'th' ? 'เริ่มต้นใช้งาน' : 'Get Started'} <CheckCircle2 className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    {language === 'th' ? 'ถัดไป' : 'Next'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Skip Button */}
          {step.id !== 'language' && currentStep < tutorialSteps.length - 1 && (
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={finishTutorial}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {language === 'th' ? 'ข้ามบทสอน' : 'Skip tutorial'}
            </motion.button>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
