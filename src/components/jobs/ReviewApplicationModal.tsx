import { motion } from 'framer-motion';
import { X, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useJobs, Application } from '@/contexts/JobContext';
import { useSettings } from '@/contexts/SettingsContext';

interface ReviewApplicationModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewApplicationModal({ application, onClose, onSuccess }: ReviewApplicationModalProps) {
  const { updateApplicationStatus, jobs } = useJobs();
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const job = jobs.find(j => j.id === application.jobId);

  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    try {
      await updateApplicationStatus(application.id, status);
      onSuccess();
      onClose();
    } catch (err) {
      alert(isRot ? 'Failed to update vibe check.' : isTh ? 'อัปเดตสถานะล้มเหลว' : 'Failed to update application status.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-speede-darkGray w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold dark:text-white">
              {isRot ? 'Vibe Check 🕵️' : isTh ? 'ตรวจสอบใบสมัคร' : 'Review Application'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {isRot ? 'For:' : isTh ? 'สำหรับงาน:' : 'For job:'} {job?.title || 'Unknown Job'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
              {isRot ? 'The Applicant' : isTh ? 'ผู้สมัคร' : 'Applicant'}
            </h4>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-speede-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.applicantName}`} alt="avatar" />
              </div>
              <div>
                <h3 className="font-bold dark:text-white text-lg">{application.applicantName}</h3>
                <p className="text-sm text-gray-500">{application.contact}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
              {isRot ? 'Lore / Past Quests' : isTh ? 'ประสบการณ์' : 'Experience'}
            </h4>
            <div className="bg-gray-50 dark:bg-speede-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm dark:text-gray-300 whitespace-pre-wrap">
              {application.experience || (isRot ? 'Bro has no lore.' : isTh ? 'ไม่มีข้อมูล' : 'No experience provided.')}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
              {isRot ? 'Why they the goat?' : isTh ? 'ทำไมถึงเหมาะกับงานนี้' : 'Why they are a good fit'}
            </h4>
            <div className="bg-gray-50 dark:bg-speede-black p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm dark:text-gray-300 whitespace-pre-wrap">
              {application.message || (isRot ? 'Bro said nothing.' : isTh ? 'ไม่มีข้อมูล' : 'No message provided.')}
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-speede-black/50 shrink-0 flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl text-base font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
            onClick={() => handleStatusUpdate('rejected')}
          >
            <XCircle className="w-5 h-5 mr-2" />
            {isRot ? 'Nah fam 🛑' : isTh ? 'ปฏิเสธ' : 'Reject'}
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl text-base font-bold bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20"
            onClick={() => handleStatusUpdate('accepted')}
          >
            <Check className="w-5 h-5 mr-2" />
            {isRot ? 'W Hire ✅' : isTh ? 'รับเข้าทำงาน' : 'Accept'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
