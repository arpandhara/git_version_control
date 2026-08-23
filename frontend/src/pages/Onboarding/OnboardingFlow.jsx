import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/axios';
import UsageIntentStep from './Steps/UsageIntentStep';
import UsernameStep from './Steps/UsernameStep';
import CoreDetailsStep from './Steps/CoreDetailsStep';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState(null); // 'version_control', 'code_editor', 'both'
  const [username, setUsername] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await apiClient.get('/users/me');
        const user = response.data.data.user;
        if (user && user.username) {
          // Already onboarded
          navigate('/dashboard');
        } else {
          setIsInitializing(false);
        }
      } catch (error) {
        // If unauthenticated (401), the apiClient interceptor will usually redirect to /
        // But just in case, we can also redirect here.
        navigate('/');
      }
    };
    checkOnboardingStatus();
  }, [navigate]);

  // Total steps logic
  const totalSteps = 3;

  const nextStep = () => {
    if (step === 3) {
      navigate('/dashboard');
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const getHeading = () => {
    switch (step) {
      case 1: return "How we may help You";
      case 2: return "Choose your username";
      case 3: return "Tell us about yourself";
      default: return "How we may help You";
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Simple loader or just blank to prevent flash */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-24 md:pt-32 p-6 sm:p-12 font-sans w-full">
      <div className="w-full max-w-5xl">
        
        {/* Header & Progress Indicator */}
        <div className="mb-12 text-center h-24">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">{getHeading()}</h1>
          <p className="text-gray-500 font-medium text-sm md:text-base tracking-wide uppercase">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Step Content with Animation */}
        <div className="relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {step === 1 && (
                <UsageIntentStep 
                  intent={intent} 
                  setIntent={setIntent} 
                  onNext={nextStep} 
                />
              )}
              {step === 2 && (
                <UsernameStep 
                  username={username}
                  setUsername={setUsername}
                  onNext={nextStep} 
                  onBack={prevStep}
                />
              )}
              {step === 3 && (
                <CoreDetailsStep 
                  username={username}
                  onNext={nextStep} 
                  onBack={prevStep}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default OnboardingFlow;
