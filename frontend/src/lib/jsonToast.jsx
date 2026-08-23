import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

const BouncyToast = ({ t, message, type = 'success' }) => {
  const toastRef = useRef(null);

  useEffect(() => {
    // Bouncy entrance animation
    if (toastRef.current) {
      animate(toastRef.current, {
        scale: [0.8, 1.05, 1],
        opacity: [0, 1],
        translateY: [10, -5, 0],
        duration: 600,
        easing: 'easeOutElastic(1, .6)',
      });
    }
  }, []);

  // Solid background colors (no glass design)
  const bgColor = type === 'error' ? 'bg-[#FF453A]' : 'bg-[#32D74B]';
  
  return (
    <div 
      ref={toastRef}
      className={`flex items-center gap-3 w-auto mx-auto px-4 py-2.5 rounded-full shadow-lg ${bgColor} text-white font-sans`}
    >
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/25 shadow-sm">
        {type === 'error' ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="text-[13px] font-medium pr-1">
        {message}
      </div>
    </div>
  );
};

export const jsonToast = {
  success: (message) => {
    toast.custom((t) => <BouncyToast t={t} message={message} type="success" />);
  },
  error: (message) => {
    toast.custom((t) => <BouncyToast t={t} message={message} type="error" />);
  }
};
