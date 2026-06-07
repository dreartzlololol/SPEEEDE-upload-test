import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Landing from '@/pages/Landing';
import Feed from '@/pages/Feed';
import JobPosting from '@/pages/JobPosting';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import MapView from '@/pages/MapView';
import ActiveWorkspace from '@/pages/ActiveWorkspace';
import Dashboard from '@/pages/Admin/Dashboard';
import AuthLayout from '@/components/layout/AuthLayout';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Settings from '@/pages/Settings';
import { JobProvider } from '@/contexts/JobContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { RequireAuth } from '@/components/auth/RequireAuth';

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
    <NotificationProvider>
    <JobProvider>
    <TutorialProvider>
      <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main App Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/post-job" element={<RequireAuth><JobPosting /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/map" element={<MapView />} />
          <Route path="/workspace/:id" element={<RequireAuth><ActiveWorkspace /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Route>
      </Routes>
    </Router>
    </TutorialProvider>
    </JobProvider>
    </NotificationProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
