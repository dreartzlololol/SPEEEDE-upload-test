import { motion } from 'framer-motion';
import { X, MapPin, Clock, Star, ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Job } from '@/contexts/JobContext';
import { useSettings } from '@/contexts/SettingsContext';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}

export function JobDetailsModal({ job, onClose, onApply }: JobDetailsModalProps) {
  const { language } = useSettings();
  const isTh = language === 'th';
  const isRot = language === 'brainrot';

  // Mock Employer Data based on job.employer
  const mockEmployerStats = {
    joined: '2023',
    jobsPosted: Math.floor(job.employerRating * 8),
    hires: Math.floor(job.employerRating * 6),
    bio: isRot 
      ? "Always paying W wages. No cap. Need hard workers." 
      : isTh 
      ? "เป็นคนง่ายๆ จ่ายตรงเวลา ชอบคนที่ตั้งใจทำงาน" 
      : "Friendly employer, always pays on time. Looking for reliable folks.",
    reviews: [
      { id: 1, text: isRot ? "W boss fr." : isTh ? "เจ้านายใจดีมากครับ" : "Great person to work for!", reviewer: "Anon_1", rating: 5 },
      { id: 2, text: isRot ? "Paid me extra. Based." : isTh ? "ให้ทิปด้วย ดีมาก" : "Very clear instructions.", reviewer: "WorkerB", rating: job.employerRating >= 4.5 ? 5 : 4 },
    ]
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white dark:bg-speede-darkGray w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 p-4 flex justify-between items-center shrink-0 bg-gradient-to-b from-black/50 to-transparent absolute w-full">
          <div className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white" onClick={(e) => e.stopPropagation()}>
            {/* Optional back button space */}
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 -mt-16">
          {/* Cover Image */}
          <div className="h-64 w-full shrink-0">
            <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 space-y-8">
            {/* Main Job Info */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <h1 className="text-2xl font-bold dark:text-white leading-tight">{job.title}</h1>
                <div className="shrink-0 bg-speede-red/10 text-speede-red font-bold px-4 py-2 rounded-xl">
                  {job.salary}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.time}</div>
                <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.category}</div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold dark:text-white mb-3">
                {isRot ? 'The Quest 📜' : isTh ? 'รายละเอียดงาน' : 'Job Description'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

            {/* Employer Profile Section */}
            <div className="bg-gray-50 dark:bg-speede-black/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold dark:text-white mb-4">
                {isRot ? 'The Quest Giver 🧙‍♂️' : isTh ? 'ผู้ประกาศงาน' : 'About the Employer'}
              </h3>
              
              <div className="flex gap-4 items-start">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-white dark:border-speede-darkGray shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${job.employer}`} alt="avatar" className="w-full h-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white dark:border-speede-darkGray">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg dark:text-white truncate">{job.employer}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <div className="flex items-center text-yellow-500 font-bold">
                      <Star className="w-4 h-4 fill-current mr-1" /> {job.employerRating}
                    </div>
                    <span>•</span>
                    <span>{mockEmployerStats.jobsPosted} {isTh ? 'งาน' : 'jobs'}</span>
                    <span>•</span>
                    <span>{isTh ? 'ตั้งแต่' : 'Joined'} {mockEmployerStats.joined}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 italic bg-white dark:bg-speede-darkGray p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    "{mockEmployerStats.bio}"
                  </p>
                </div>
              </div>

              {/* Reviews Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                {mockEmployerStats.reviews.map(review => (
                  <div key={review.id} className="flex gap-2 text-sm">
                    <div className="font-medium dark:text-gray-300 min-w-[60px]">{review.reviewer}:</div>
                    <div className="text-gray-500 dark:text-gray-400 flex-1 flex flex-col">
                      <span>"{review.text}"</span>
                      <div className="flex text-yellow-500 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-speede-darkGray shrink-0">
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-speede-red/20"
            onClick={onApply}
          >
            {isRot ? 'W Rizz (Apply) 🔥' : isTh ? 'สมัครงานนี้' : 'Apply Now'}
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
