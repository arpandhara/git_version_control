import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Navbar from './Navbar';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitializing, fetchUser } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      // If we don't have a user in store, fetch it
      if (!user) {
        const fetchedUser = await fetchUser();
        if (!fetchedUser) {
          navigate('/', { replace: true });
        } else if (!fetchedUser.username) {
          // If logged in but no username, go to onboarding
          navigate('/onboarding', { replace: true });
        }
      }
    };
    init();
  }, [user, fetchUser, navigate, location.pathname]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Prevent flash */}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      {/* Add top padding so content is not hidden behind the fixed navbar */}
      <main className="flex-grow pt-14 relative z-0">
        {children}
      </main>
    </div>
  );
}
