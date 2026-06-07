import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = '/api';

export type Job = {
  id: number;
  title: string;
  salary: string;
  location: string;
  time: string;
  employer: string;
  employerEmail?: string;
  employerRating: number;
  category: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  isUrgent?: boolean;
};

export type Application = {
  id: number;
  jobId: number;
  applicantName: string;
  contact: string;
  experience: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
};

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  applications: Application[];
  submitApplication: (app: Omit<Application, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  updateApplicationStatus: (appId: number, status: 'accepted' | 'rejected') => Promise<void>;
  hiddenJobs: number[];
  hideJob: (jobId: number) => void;
}

import { useSettings } from '@/contexts/SettingsContext';
import { soundEffects } from '@/lib/soundEffects';
import { useNotifications, pushNotificationToUser } from '@/contexts/NotificationContext';

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { theme, language } = useSettings();
  const { addNotification } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [hiddenJobs, setHiddenJobs] = useState<number[]>([]);

  // Fetch initial jobs and applications
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const jobsRes = await fetch(`${API_BASE}/jobs`, {
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }

        const appsRes = await fetch(`${API_BASE}/applications`, {
          headers: { 'bypass-tunnel-reminder': 'true' }
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData);
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
      }
    };

    fetchInitialData();

    const savedHidden = localStorage.getItem('speede_hidden_jobs');
    if (savedHidden) {
      setHiddenJobs(JSON.parse(savedHidden));
    }
  }, []);

  const addJob = async (job: Omit<Job, 'id'>) => {
    const isTh = language === 'th';
    const isRot = language === 'brainrot';
    try {
      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify(job)
      });
      if (response.ok) {
        const newJob = await response.json();
        setJobs(prevJobs => [newJob, ...prevJobs]);
        soundEffects.play('success', theme, language);
        
        // Add notification
        addNotification(
          isTh ? 'ลงประกาศงานสำเร็จ! 💼' : isRot ? 'Dropped a quest! 💼' : 'Job Posted Successfully! 💼',
          isTh ? `ประกาศงาน "${newJob.title}" ของคุณพร้อมใช้งานแล้ว` : isRot ? `Your side quest "${newJob.title}" is live. No cap.` : `Your job "${newJob.title}" is now active.`,
          'success'
        );

        // Bots removed as requested

      } else {
        soundEffects.play('failure', theme, language);
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add job');
      }
    } catch (err) {
      soundEffects.play('failure', theme, language);
      throw err;
    }
  };

  const submitApplication = async (app: Omit<Application, 'id' | 'status' | 'timestamp'>) => {
    const isTh = language === 'th';
    const isRot = language === 'brainrot';
    try {
      const response = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify(app)
      });
      if (response.ok) {
        const newApp = await response.json();
        setApplications(prevApps => [newApp, ...prevApps]);
        soundEffects.play('success', theme, language);

        const job = jobs.find(j => j.id === newApp.jobId);
        addNotification(
          isTh ? 'ส่งใบสมัครงานสำเร็จ! 📤' : isRot ? 'Secured the request! 📤' : 'Application Sent! 📤',
          isTh ? `ส่งใบสมัครสำหรับงาน "${job?.title || 'งาน'}" เรียบร้อยแล้ว รอผู้จ้างตรวจสอบ` : isRot ? `You sent an application to "${job?.title || 'quest'}". Wait for the employer to review. No cap.` : `Your application for "${job?.title || 'job'}" has been sent. Waiting for employer review.`,
          'info',
          '/profile'
        );

        // Push notification to the employer's account
        const employerEmail = job?.employerEmail || `${job?.employer?.toLowerCase().replace(/\s+/g, '')}@speede.com`;
        pushNotificationToUser(
          employerEmail,
          isTh ? '[มุมมองผู้จ้าง] ผู้สมัครงานรายใหม่! 👥' : isRot ? '[Employer View] Applicant sliding in! 👥' : '[Employer View] New Job Applicant! 👥',
          isTh ? `มีผู้สมัครงาน "${newApp.applicantName}" ของคุณ คลิกเพื่อตรวจสอบและอนุมัติ` : isRot ? `Someone applied to "${job?.title || 'quest'}". Click to vibe check 'em.` : `Someone applied to your job "${job?.title || 'job'}". Click to review.`,
          'info',
          '/profile',
          { application: newApp }
        );

      } else {
        soundEffects.play('failure', theme, language);
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit application');
      }
    } catch (err) {
      soundEffects.play('failure', theme, language);
      throw err;
    }
  };

  const updateApplicationStatus = async (appId: number, status: 'accepted' | 'rejected' | 'abandoned') => {
    try {
      const response = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updatedApp = await response.json();
        setApplications(prevApps => prevApps.map(app => app.id === appId ? updatedApp : app));
        soundEffects.play('success', theme, language);

        const isTh = language === 'th';
        const isRot = language === 'brainrot';
        const job = jobs.find(j => j.id === updatedApp.jobId);
        
        // Push notification directly to applicant's email using app.contact
        const applicantEmail = updatedApp.contact;
        
        if (status === 'accepted') {
          pushNotificationToUser(
            applicantEmail,
            isTh ? 'ยินดีด้วย! รับเข้าทำงาน 🎉' : isRot ? 'W Rizz! Quest Accepted 🎉' : 'Congratulations! You are hired 🎉',
            isTh ? `คุณถูกรับเข้าทำงาน "${job?.title || 'งาน'}" แล้ว!` : isRot ? `You passed the vibe check for "${job?.title || 'quest'}"!` : `You have been accepted for the job "${job?.title || 'job'}"!`,
            'success',
            `/workspace/${updatedApp.id}`
          );
        } else if (status === 'rejected') {
          pushNotificationToUser(
            applicantEmail,
            isTh ? 'เสียใจด้วย ใบสมัครถูกปฏิเสธ 😔' : isRot ? 'L Rizz. Quest Rejected 😔' : 'Application Rejected 😔',
            isTh ? `ใบสมัครสำหรับงาน "${job?.title || 'งาน'}" ของคุณถูกปฏิเสธ` : isRot ? `You failed the vibe check for "${job?.title || 'quest'}".` : `Your application for "${job?.title || 'job'}" was rejected.`,
            'urgent',
            '/profile'
          );
        } else if (status === 'abandoned') {
          // If applicant abandons, send a notification to the employer!
          const employerEmail = job?.employerEmail || `${job?.employer?.toLowerCase().replace(/\s+/g, '')}@speede.com`;
          pushNotificationToUser(
            employerEmail,
            isTh ? 'ผู้รับจ้างยกเลิกงาน ⚠️' : isRot ? 'Bro dipped ⚠️' : 'Worker abandoned job ⚠️',
            isTh ? `ผู้รับจ้างงาน "${job?.title || 'งาน'}" ของคุณได้ยกเลิกและทิ้งงานไปแล้ว` : isRot ? `The worker for "${job?.title || 'quest'}" just ghosted you.` : `The worker for your job "${job?.title || 'job'}" has abandoned the workspace.`,
            'urgent',
            '/profile'
          );
        }
      } else {
        soundEffects.play('failure', theme, language);
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update application status');
      }
    } catch (err) {
      soundEffects.play('failure', theme, language);
      throw err;
    }
  };

  const hideJob = (jobId: number) => {
    if (!hiddenJobs.includes(jobId)) {
      const updated = [...hiddenJobs, jobId];
      setHiddenJobs(updated);
      localStorage.setItem('speede_hidden_jobs', JSON.stringify(updated));
    }
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, applications, submitApplication, updateApplicationStatus, hiddenJobs, hideJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}
