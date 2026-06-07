import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Map, XCircle } from 'lucide-react';

export function ActiveJobPrompt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applications, updateApplicationStatus } = useJobs();
  const { user } = useAuth();
  const { language } = useSettings();

  const [showPrompt, setShowPrompt] = useState(false);
  const [activeAppId, setActiveAppId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setShowPrompt(false);
      return;
    }

    const isWorkspacePage = location.pathname.startsWith('/workspace');
    
    // Check for an accepted application belonging to the current user
    const activeApp = applications.find(
      a => a.contact === user.email && a.status === 'accepted'
    );

    if (activeApp && !isWorkspacePage) {
      setActiveAppId(activeApp.id);
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
      setActiveAppId(null);
    }
  }, [location.pathname, applications, user]);

  const handleReturnToJob = () => {
    if (activeAppId) {
      navigate(`/workspace/${activeAppId}`);
      setShowPrompt(false);
    }
  };

  const handleAbandonJob = async () => {
    if (activeAppId) {
      // We use 'abandoned' status to avoid sending a rejection notification to the applicant
      try {
        await updateApplicationStatus(activeAppId, 'abandoned' as any);
        setShowPrompt(false);
      } catch (err) {
        console.error("Failed to abandon job", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-speede-darkGray max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
          >
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'th' ? 'คุณมีงานที่กำลังทำอยู่!' : 'Active Job in Progress!'}
            </h2>
            
            <p className="text-gray-500 mb-6 text-sm">
              {language === 'th' 
                ? 'คุณได้ออกกจากหน้าพื้นที่ทำงานในขณะที่งานยังไม่เสร็จสิ้น คุณต้องการกลับไปทำงานต่อ หรือต้องการยกเลิกงานนี้?' 
                : 'You left the workspace while you have an active job. Do you want to return to the job or abandon it?'}
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleReturnToJob}
                className="w-full flex items-center justify-center gap-2 py-3 bg-speede-red text-white rounded-xl font-bold shadow-lg shadow-speede-red/30 active:scale-95 transition-transform"
              >
                <Map className="w-5 h-5" />
                {language === 'th' ? 'กลับไปที่พื้นที่ทำงาน' : 'Return to Workspace'}
              </button>
              
              <button 
                onClick={handleAbandonJob}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-transform"
              >
                <XCircle className="w-5 h-5" />
                {language === 'th' ? 'ยกเลิกงานทิ้ง' : 'Abandon Job'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
