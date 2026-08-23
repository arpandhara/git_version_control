import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

export default function Dashboard() {
  const { user, isInitializing } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-6 font-sans"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center mt-10">
        <h1 className="text-4xl font-serif mb-2 tracking-tight text-gray-900">Dashboard</h1>
        {isInitializing ? (
          <p className="text-gray-500 mb-8 font-medium">Loading...</p>
        ) : user ? (
          <p className="text-gray-500 mb-8 font-medium">
            Welcome back, <span className="font-bold text-black">{user.name || user.username}</span>!
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
