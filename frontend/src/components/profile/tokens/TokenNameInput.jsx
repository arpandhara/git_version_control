import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Lottie } from 'lottie-react';
import loadingAnimation from '../../../assets/Loading V2/loadingV2.json';
import apiClient from '../../../lib/axios';

export default function TokenNameInput({ actionLoading, onSubmit, onBack }) {
  const [tokenName, setTokenName] = useState('');
  
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const checkName = async () => {
      const trimmed = tokenName.trim();
      if (!trimmed) {
        setIsAvailable(true);
        setSuggestions([]);
        return;
      }
      
      setIsChecking(true);
      try {
        const res = await apiClient.get(`/tokens/check-name?name=${encodeURIComponent(trimmed)}`);
        setIsAvailable(res.data.data.available);
        setSuggestions(res.data.data.suggestions || []);
      } catch (err) {
        console.error('Failed to check token name', err);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceId = setTimeout(checkName, 400); // 400ms debounce
    return () => clearTimeout(debounceId);
  }, [tokenName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tokenName.trim() && isAvailable && !isChecking) {
      onSubmit(tokenName);
    }
  };

  return (
    <motion.div 
      key="name"
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full relative py-2"
    >
      <motion.button
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
        onClick={onBack}
        className="absolute -top-2 -left-2 group flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50/0 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-0.5 transition-transform" />
        Back
      </motion.button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full mt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          New Personal Access Token
        </h2>
        <p className="text-gray-500 text-sm mb-8 text-center">
          Give your token a descriptive name to remember its purpose.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full max-w-[280px] relative mb-1">
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g. My MacBook Pro"
              className={`w-full px-4 py-2.5 text-sm border ${!isAvailable ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500'} rounded-lg focus:outline-none focus:ring-1 transition-all bg-white shadow-sm pr-10`}
              autoFocus
              required
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {!isAvailable && !isChecking && tokenName.trim() && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-[280px] overflow-hidden"
              >
                <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 mb-2">
                  <AlertCircle size={14} />
                  <span>This name is already in use.</span>
                </div>
                
                {suggestions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1.5">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTokenName(s)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md transition-colors cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={actionLoading || !tokenName.trim() || !isAvailable || isChecking}
            className="inline-flex items-center justify-center gap-1.5 w-full max-w-[280px] px-4 py-2.5 bg-emerald-500 text-white text-[13px] font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {actionLoading ? (
              <div className="w-4 h-4 flex items-center justify-center">
                <Lottie src={loadingAnimation} autoplay loop style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
              </div>
            ) : (
              <>
                <Plus size={14} strokeWidth={2} />
                <span>Continue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
