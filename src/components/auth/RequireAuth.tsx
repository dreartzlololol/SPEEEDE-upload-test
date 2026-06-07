import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, showAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // Show the auth modal
      showAuthModal();
      
      // Redirect to home/feed instead of staying on the protected route
      navigate('/feed', { replace: true, state: { from: location } });
    }
  }, [user, navigate, showAuthModal, location]);

  // If there's a user, render the children (the protected page)
  // Otherwise render nothing (or a loader) while the redirect happens
  return user ? children : null;
}
