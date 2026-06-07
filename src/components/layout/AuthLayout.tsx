import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/feed" replace />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-speede-black p-4">
      <BackgroundEffects />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-speede-red rounded-2xl flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-2xl italic">S</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
