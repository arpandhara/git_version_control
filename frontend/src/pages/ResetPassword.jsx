import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PasswordInput from '../components/PasswordInput';
import { Lottie } from 'lottie-react';
import loadingAnimation from '../assets/Loading V2/loadingV2.json';
import { jsonToast } from '../lib/jsonToast';

export default function ResetPassword({ onSubmit, onBack, isLoading }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      jsonToast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      jsonToast.error('Password must be at least 8 characters');
      return;
    }

    if (onSubmit) onSubmit(password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto p-8 sm:p-12"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group mb-8 flex items-center text-sm font-semibold text-gray-400 hover:text-black transition-colors cursor-pointer"
      >
        <svg
          className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-5xl font-serif mb-2 tracking-tight">New Password</h1>
      <p className="text-gray-400 text-sm font-sans mb-8 leading-relaxed">
        Please enter your new password below. Make sure it's at least 8 characters.
      </p>

      <form className="space-y-6 font-sans" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-black mb-2">
            New Password
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-2">
            Confirm Password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            showChecks={false}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed h-12"
        >
          {isLoading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Lottie src={loadingAnimation} autoplay loop style={{ width: 32, height: 32, filter: 'brightness(0) invert(1)' }} />
            </div>
          ) : (
            <>
              <span className='text-emerald-500'>$russty</span>
              <span>Reset Password</span>
              <svg className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
