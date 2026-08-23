import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import VerifyOTP from './VerifyOTP';
import ResetPassword from './ResetPassword';
import { Lottie } from 'lottie-react';
import loadingAnimation from '../assets/Loading V2/loadingV2.json';
import apiClient from '../lib/axios';
import { jsonToast } from '../lib/jsonToast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'verify', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      jsonToast.success('Password reset OTP sent to email');
      setIsLoading(false);
      setStep('verify');
    } catch (err) {
      setIsLoading(false);
      jsonToast.error(err.response?.data?.message || 'Failed to request reset OTP.');
    }
  };

  const handleVerify = (otpValue) => {
    setOtp(otpValue);
    setStep('reset');
  };

  const handleReset = async (newPassword) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      jsonToast.success('Password reset successfully');
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      jsonToast.error(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'verify' && (
        <VerifyOTP
          key="verify"
          onBack={() => setStep('email')}
          onVerify={handleVerify}
        />
      )}

      {step === 'reset' && (
        <ResetPassword
          key="reset"
          onBack={() => setStep('verify')}
          onSubmit={handleReset}
          isLoading={isLoading}
        />
      )}

      {step === 'email' && (
        <motion.div
          key="email"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto p-8 sm:p-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="group mb-8 flex items-center text-sm font-semibold text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-5xl font-serif mb-2 tracking-tight">Reset Password</h1>
          <p className="text-gray-400 text-sm font-sans mb-8 leading-relaxed">
            Enter the email address associated with your account and we'll send you a secure link to reset your password.
          </p>

          <form className="space-y-6 font-sans" onSubmit={handleEmailSubmit}>
            <div>
              <label className="block text-xs font-semibold text-black mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-black transition-colors"
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
                  <span className='text-emerald-500'>$rusty</span>
                  <span>Sent Verification Code</span>
                  <svg className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
