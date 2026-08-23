import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import WaveScene from './WaveScene';
import ForgotPasswordVisual from './ForgotPasswordVisual';

export default function AuthLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const isForgotPassword = location.pathname === '/forgot-password';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { default: apiClient } = await import('../lib/axios');
        const response = await apiClient.get('/users/me');
        const user = response.data.data.user;
        if (user) {
          if (user.username) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (error) {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Prevent flashing the login form */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        {children}
      </div>

      {/* Right Column - Visual (Hidden on small screens) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-white overflow-hidden">
        <AnimatePresence mode="wait">
          {isForgotPassword ? (
            <motion.div
              key="forgotPassword"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <ForgotPasswordVisual />
            </motion.div>
          ) : (
            <motion.div
              key="waveScene"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <WaveScene />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
