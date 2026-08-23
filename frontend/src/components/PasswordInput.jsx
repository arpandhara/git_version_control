import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lottie } from 'lottie-react';
import visibilityAnimation from '../assets/Visibility V3/visibility-V3.json';

export default function PasswordInput({ value, onChange, placeholder = "Enter your password", showChecks = true }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const lottieRef = useRef(null);

  const toggleShow = () => {
    const nextShow = !show;
    setShow(nextShow);
    if (lottieRef.current) {
      // Force the animation to play the segment and stay at the last frame of that segment
      if (nextShow) {
        lottieRef.current.playSegments([0, 17], true);
      } else {
        lottieRef.current.playSegments([17, 0], true);
      }
    }
  };

  // Criteria
  const criteria = [
    { id: 'length', label: '8+ characters', regex: /.{8,}/ },
    { id: 'number', label: '1 number', regex: /[0-9]/ },
    { id: 'upper', label: '1 uppercase', regex: /[A-Z]/ },
    { id: 'special', label: '1 special char', regex: /[^A-Za-z0-9]/ },
  ];

  const getMet = (regex) => regex.test(value || '');

  const sortedCriteria = [...criteria].sort((a, b) => {
    const aMet = getMet(a.regex);
    const bMet = getMet(b.regex);
    if (aMet === bMet) {
      return criteria.indexOf(a) - criteria.indexOf(b);
    }
    return aMet ? -1 : 1;
  });

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-black transition-colors pr-10"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer outline-none"
        >
          <Lottie
            lottieRef={lottieRef}
            src={visibilityAnimation}
            autoplay={false}
            loop={false}
            style={{ width: 24, height: 24 }}
            initialSegment={show ? [0, 17] : [0, 0]}
          />
        </button>
      </div>

      {/* Floating Checks Box */}
      <AnimatePresence>
        {showChecks && (focused || (value && value.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 lg:left-[calc(100%+1rem)] top-[calc(100%+0.5rem)] lg:top-0 w-full lg:w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-4 z-50 pointer-events-none"
          >
            <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
              Password Requirements
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
    </div>
  );
}
