import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobs, Job } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

interface ApplicationModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const { submitApplication } = useJobs();
  const { user } = useAuth();
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  const [formData, setFormData] = useState({
    applicantName: user?.name || '',
    contact: user?.email || '',
    experience: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitApplication({
        jobId: job.id,
        applicantName: formData.applicantName,
        contact: formData.contact,
        experience: formData.experience,
        message: formData.message,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(isRot ? 'Failed to apply fr' : isTh ? 'ส่งใบสมัครล้มเหลว' : 'Failed to submit application.');
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
              {isRot ? 'Shoot your shot 🎯' : isTh ? 'สมัครงาน' : 'Apply for Job'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {job.title} • {job.employer}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-speede-black rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="apply-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRot ? 'What they call u' : isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}
              </label>
              <Input 
                required 
                value={formData.applicantName}
                onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                placeholder={isRot ? "John Doe fr" : isTh ? "สมชาย ใจดี" : "John Doe"} 
                className="bg-gray-50 dark:bg-speede-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRot ? 'Drop the digits/email' : isTh ? 'เบอร์โทร / อีเมล' : 'Contact Info'}
              </label>
              <Input 
                required 
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder={isRot ? "johndoe@rizz.com" : isTh ? "081-xxx-xxxx" : "john@example.com"} 
                className="bg-gray-50 dark:bg-speede-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRot ? 'Lore / Past Quests' : isTh ? 'ประสบการณ์ที่เกี่ยวข้อง' : 'Relevant Experience'}
              </label>
              <textarea 
                required
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder={isRot ? "I used to lift heavy circles..." : isTh ? "เคยทำงานส่งของ 2 ปี..." : "I have 2 years of experience..."}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-speede-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-speede-red dark:text-white min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRot ? 'Why you the goat? 🐐' : isTh ? 'ทำไมถึงเหมาะกับงานนี้' : 'Why are you a good fit?'}
              </label>
              <textarea 
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                placeholder={isRot ? "Cause I got that dog in me..." : isTh ? "ฉันมีความรับผิดชอบ..." : "I am highly reliable and..."}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-speede-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-speede-red dark:text-white min-h-[100px] resize-y"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-speede-black/50 shrink-0">
          <Button type="submit" form="apply-form" className="w-full h-12 rounded-xl text-base font-bold shadow-md shadow-speede-red/20">
            {isRot ? 'Send it 🚀' : isTh ? 'ส่งใบสมัคร' : 'Submit Application'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
