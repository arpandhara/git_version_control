import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../../lib/axios';
import { Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusing backend logic constraints
const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and dashes allowed')
});

const UsernameStep = ({ username: initialUsername, setUsername, onNext, onBack }) => {
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState(initialUsername || '');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: initialUsername || '' },
    mode: 'onChange'
  });

  const currentUsername = watch('username');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(currentUsername);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentUsername]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || errors.username) {
        setIsAvailable(null);
        return;
      }
      
      setIsChecking(true);
      try {
        const response = await apiClient.get(`/users/check-username?q=${debouncedUsername}`);
        
        setIsAvailable(response.data.data.available);
        setSuggestions(response.data.data.suggestions || []);
      } catch (error) {
        // If 409 or other error, consider it unavailable
        setIsAvailable(false);
        setSuggestions([]);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername, errors.username]);

  const onSubmit = (data) => {
    if (isAvailable) {
      setUsername(data.username);
      onNext();
    }
  };

  const criteria = [
    { id: 'min_length', label: '3+ characters', regex: /.{3,}/ },
    { id: 'max_length', label: 'Under 30 characters', regex: /^.{0,30}$/ },
    { id: 'valid_chars', label: 'Letters, numbers, _, -', regex: /^[a-zA-Z0-9_-]+$/ },
  ];

  const getMet = (regex) => {
    if (!currentUsername) return false;
    if (regex.source === '^.{0,30}$') {
      return currentUsername.length > 0 && currentUsername.length <= 30;
    }
    return regex.test(currentUsername);
  };

  const sortedCriteria = [...criteria].sort((a, b) => {
    const aMet = getMet(a.regex);
    const bMet = getMet(b.regex);
    if (aMet === bMet) {
      return criteria.indexOf(a) - criteria.indexOf(b);
    }
    return aMet ? -1 : 1; 
  });

  return (
    <div className="flex flex-col">
      <button 
        onClick={onBack}
        className="self-start flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>



      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm mx-auto flex flex-col">
        <div className="mb-6 relative">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-medium">
              @
            </span>
            <input
              id="username"
              type="text"
              {...register('username', {
                onBlur: () => setFocused(false)
              })}
              onFocus={() => setFocused(true)}
              className={`block w-full pl-8 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all
                ${errors.username || isAvailable === false 
                  ? 'border-red-300 focus:ring-red-200' 
                  : isAvailable 
                    ? 'border-green-300 focus:ring-green-200' 
                    : 'border-gray-200 focus:ring-green-100 focus:border-green-500'}`}
              placeholder="e.g. janesmith"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isChecking && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
              {!isChecking && isAvailable === true && <Check className="w-5 h-5 text-green-500" />}
              {!isChecking && isAvailable === false && <X className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          
          <AnimatePresence>
            {(focused || (currentUsername && currentUsername.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 lg:left-[calc(100%+1rem)] top-[calc(100%+0.5rem)] lg:top-0 w-full lg:w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-4 z-50 pointer-events-none"
              >
                <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                  Username Rules
                </div>
                <div className="flex flex-col gap-2">
                  {sortedCriteria.map((c) => {
                    const met = getMet(c.regex);
                    return (
                      <motion.div
                        layout
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center text-xs font-medium"
                      >
                        <motion.div
                          animate={{ 
                            backgroundColor: met ? '#10b981' : '#f3f4f6',
                            borderColor: met ? '#10b981' : '#e5e7eb',
                          }}
                          className="w-4 h-4 rounded-full border flex items-center justify-center mr-2.5 shrink-0"
                        >
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: met ? 1 : 0 }}
                            className="w-2.5 h-2.5 text-white" 
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </motion.svg>
                        </motion.div>
                        <motion.span
                          animate={{
                            color: met ? '#9ca3af' : '#111827',
                          }}
                          className="relative"
                        >
                          {c.label}
                          <motion.span
                            initial={false}
                            animate={{ width: met ? '100%' : '0%' }}
                            className="absolute left-0 top-1/2 h-[1px] bg-gray-400 -translate-y-1/2"
                          />
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {errors.username && (
            <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
          )}
          {!errors.username && isAvailable === false && !isChecking && (
            <div className="mt-3">
              <p className="text-sm text-red-600 mb-2">This username is already taken. Try these instead:</p>
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setValue('username', sug, { shouldValidate: true });
                        setSuggestions([]);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full text-xs text-gray-700 font-medium transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isAvailable || isChecking}
          className="group w-full bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed h-12"
        >
          <span className='text-emerald-500'>$rusty</span>
          <span>Continue</span>
          <svg
            className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default UsernameStep;
