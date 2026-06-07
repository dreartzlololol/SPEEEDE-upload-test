import { useState } from 'react';
import { useJobs, Job } from '@/contexts/JobContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { createCustomIcon } from '@/lib/mapIcon';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { ApplicationModal } from '@/components/jobs/ApplicationModal';
import { PageTransition } from '@/components/ui/PageTransition';

export default function MapView() {
  const { jobs } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailedJob, setDetailedJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Photharam District, Ratchaburi approximate coordinates
  const centerPosition: [number, number] = [13.6922, 99.8536];

  return (
    <PageTransition className="relative w-full h-[calc(100vh-10rem)] theme-panel overflow-hidden z-0">
      
      <MapContainer center={centerPosition} zoom={13} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Map Creator: pobpetch'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {jobs.map((job) => (
          <Marker 
            key={job.id} 
            position={[job.lat, job.lng]}
            icon={createCustomIcon(!!job.isUrgent)}
            eventHandlers={{
              click: () => setSelectedJob(job),
            }}
          />
        ))}
      </MapContainer>

      {/* Selected Job Card Overlay */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute z-10 bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white dark:bg-speede-darkGray p-4 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold dark:text-white text-lg leading-tight">{selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="text-speede-red font-bold mb-2">{selectedJob.salary}</div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{selectedJob.description}</p>
            <button 
              onClick={() => setDetailedJob(selectedJob)}
              className="w-full py-2 bg-speede-black text-white dark:bg-white dark:text-speede-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View Details
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute z-10 top-6 left-6 bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium shadow-sm border border-white/20">
        Photharam District, Ratchaburi
      </div>

      <AnimatePresence>
        {detailedJob && (
          <JobDetailsModal 
            job={detailedJob} 
            onClose={() => setDetailedJob(null)}
            onApply={() => {
              setDetailedJob(null);
              setApplyingJob(detailedJob);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyingJob && (
          <ApplicationModal 
            job={applyingJob} 
            onClose={() => setApplyingJob(null)} 
            onSuccess={() => {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-speede-black text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-50 whitespace-nowrap"
          >
            Application sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
