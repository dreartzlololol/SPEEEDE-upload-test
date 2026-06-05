import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Landing from '@/pages/Landing';
import Feed from '@/pages/Feed';
import JobPosting from '@/pages/JobPosting';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import MapView from '@/pages/MapView';
import Dashboard from '@/pages/Admin/Dashboard';
import AuthLayout from '@/components/layout/AuthLayout';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Settings from '@/pages/Settings';
import { JobProvider } from '@/contexts/JobContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
    <JobProvider>
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
          <Route path="/post-job" element={<JobPosting />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/admin" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
    </JobProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
