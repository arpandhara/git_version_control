import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import WaveScene from './WaveScene';
import ForgotPasswordVisual from './ForgotPasswordVisual';

export default function AuthLayout({ children }) {
  const location = useLocation();
  const isForgotPassword = location.pathname === '/forgot-password';
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
