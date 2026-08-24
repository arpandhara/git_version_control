import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { jsonToast } from '../../../lib/jsonToast';

export default function TokenSuccess({ generatedToken, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      jsonToast.success('Token copied to clipboard');
    }
  };

  return (
    <motion.div 
      key="success"
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full py-4 items-center justify-center max-w-md mx-auto"
    >
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-500">
        <Check size={24} strokeWidth={2.5} />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Token Generated Successfully
      </h2>
      
      <div className="w-full flex items-start gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-xl mb-6">
        <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed text-orange-800/90">
          <span className="font-semibold block mb-0.5">Make sure to copy your token now.</span>
          For security reasons, you will not be able to view it again once you close this window.
        </div>
      </div>

      <div className="w-full flex items-center gap-2 mb-8 relative">
        <div className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
          <code className="text-sm text-gray-800 break-all select-all font-mono tracking-tight leading-none">
            {generatedToken}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="p-3.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg transition-colors border border-gray-200 shadow-sm shrink-0 cursor-pointer flex items-center justify-center w-12 h-[50px]"
          title="Copy to clipboard"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-[280px] bg-black text-white text-[13px] font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
      >
        I have copied it
      </button>
    </motion.div>
  );
}
