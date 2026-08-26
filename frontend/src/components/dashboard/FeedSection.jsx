import React from 'react';
import { motion } from 'framer-motion';
import { Rss, SlidersHorizontal, Inbox } from 'lucide-react';

export default function FeedSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18 }}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rss size={14} strokeWidth={1.6} className="text-gray-400" />
          <span className="text-[13px] font-semibold text-gray-700">Feed</span>
        </div>

        <button className="flex items-center gap-1.5 text-[11.5px] font-medium text-gray-400 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300 transition-all cursor-pointer">
          <SlidersHorizontal size={11} strokeWidth={1.8} />
          Filter
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
          <Inbox size={20} strokeWidth={1.3} className="text-gray-300" />
        </div>
        <p className="text-[13px] font-medium text-gray-400 mb-1">Your feed is empty</p>
        <p className="text-[12px] text-gray-300 max-w-[200px] leading-relaxed">
          Follow people or star repositories to see activity here.
        </p>
      </div>
    </motion.div>
  );
}
