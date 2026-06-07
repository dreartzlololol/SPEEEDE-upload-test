import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs, Application, Job } from '@/contexts/JobContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { WorkspaceMap } from '@/components/workspace/WorkspaceMap';
import { WorkspaceChat } from '@/components/workspace/WorkspaceChat';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, MessageSquare, Map as MapIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '@/contexts/SettingsContext';

export default function ActiveWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { applications, jobs } = useJobs();
  const { user } = useAuth();
  const { language } = useSettings();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');

  useEffect(() => {
    if (!id || applications.length === 0 || jobs.length === 0) return;

    const foundApp = applications.find(a => a.id.toString() === id);
    if (foundApp) {
      setApplication(foundApp);
      const foundJob = jobs.find(j => j.id === foundApp.jobId);
      if (foundJob) {
        setJob(foundJob);
      }
    }
  }, [id, applications, jobs]);

  if (!user || !id) {
    return (
      <PageTransition className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-speede-red" />
      </PageTransition>
    );
  }

  if (!application || !job) {
    return (
      <PageTransition className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Workspace Not Found</h2>
        <p className="text-gray-500 mb-6">Could not find the application or job details.</p>
        <button 
          onClick={() => navigate('/profile')}
          className="px-6 py-3 bg-speede-red text-white rounded-xl font-bold shadow-lg shadow-speede-red/30 active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </PageTransition>
    );
  }

  const employerEmail = job.employerEmail || `${job.employer.toLowerCase().replace(/\s+/g, '')}@speede.com`;

  return (
    <PageTransition className="w-full h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] theme-panel flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Mobile Tabs */}
      <div className="md:hidden flex bg-white dark:bg-speede-darkGray p-2 z-10 border-b border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm",
              activeTab === 'map' ? "bg-white dark:bg-speede-darkGray shadow text-speede-red" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <MapIcon className="w-4 h-4" />
            {language === 'th' ? 'นำทาง' : 'GPS'}
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm",
              activeTab === 'chat' ? "bg-white dark:bg-speede-darkGray shadow text-speede-red" : "text-gray-500 dark:text-gray-400"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {language === 'th' ? 'แชท' : 'Chat'}
          </button>
        </div>
      </div>

      {/* Desktop Header Overlay */}
      <div className="hidden md:flex absolute top-4 left-4 z-[500] items-center gap-4">
        <button 
          onClick={() => navigate('/profile')}
          className="p-3 bg-white dark:bg-speede-darkGray rounded-full shadow-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className={clsx(
        "flex-1 w-full h-full relative",
        activeTab === 'map' ? "block" : "hidden md:block md:w-2/3 lg:w-3/4"
      )}>
        <WorkspaceMap 
          jobLat={job.lat} 
          jobLng={job.lng} 
          jobTitle={job.title} 
        />
      </div>

      <div className={clsx(
        "w-full h-full md:w-1/3 lg:w-1/4 min-w-[320px] bg-white dark:bg-speede-darkGray",
        activeTab === 'chat' ? "block" : "hidden md:block"
      )}>
        <WorkspaceChat 
          employerEmail={employerEmail} 
          employerName={job.employer} 
        />
      </div>
      
    </PageTransition>
  );
}
