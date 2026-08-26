import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, ImagePlus, SendHorizonal, Sparkles } from 'lucide-react';

export default function AskBox() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
      className={`relative rounded-3xl border transition-all duration-300 bg-white overflow-hidden flex flex-col ${
        focused
          ? 'border-gray-300 shadow-lg shadow-gray-200/50 ring-4 ring-gray-50'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
      }`}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Ask anything... (type @ for context)"
        rows={1}
        className="w-full px-5 pt-5 pb-3 text-[14.5px] text-gray-800 placeholder-gray-400 bg-transparent resize-none outline-none leading-relaxed"
        style={{ minHeight: 64 }}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 pb-3 pt-0">
        <div className="flex items-center gap-2">
          {/* Add Repo */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold text-gray-500 bg-gray-50/80 border border-gray-100 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-all cursor-pointer group">
            <BookMarked size={12} strokeWidth={2} className="group-hover:text-blue-500 transition-colors" />
            <span>Repo</span>
          </button>

          {/* Add Media */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-semibold text-gray-500 bg-gray-50/80 border border-gray-100 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-all cursor-pointer group">
            <ImagePlus size={12} strokeWidth={2} className="group-hover:text-violet-500 transition-colors" />
            <span>Media</span>
          </button>
        </div>

        {/* Send */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer ${
            hasText
              ? 'bg-black text-white shadow-md hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-default'
          }`}
          disabled={!hasText}
        >
          <SendHorizonal size={15} strokeWidth={2} className={hasText ? 'ml-0.5' : ''} />
        </motion.button>
      </div>
    </motion.div>
  );
}
