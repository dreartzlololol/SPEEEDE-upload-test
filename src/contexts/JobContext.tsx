import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = '/api';

export type Job = {
  id: number;
  title: string;
  salary: string;
  location: string;
  time: string;
  employer: string;
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

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { theme, language } = useSettings();
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

  const updateApplicationStatus = async (appId: number, status: 'accepted' | 'rejected') => {
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
