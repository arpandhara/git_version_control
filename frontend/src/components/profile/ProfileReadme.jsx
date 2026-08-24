import React from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

export default function ProfileReadme({ user }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="flex-1 min-w-0"
    >
      {/* README placeholder card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab-style header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="text-[13px] font-semibold text-gray-700">
            {user?.username}
          </span>
          <span className="text-[13px] text-gray-400">/</span>
          <span className="text-[13px] font-semibold text-gray-700">README</span>
          <span className="text-[11px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 ml-1">
            .md
          </span>
        </div>

        {/* Empty content area */}
        <div className="p-8 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
              <Pencil size={18} strokeWidth={1.4} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">
              No README yet
            </p>
            <p className="text-xs text-gray-300">
              Add a README to tell people about yourself
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
