import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleDot,
  Key,
  GitBranch,
  GitPullRequest,
  Rss,
} from 'lucide-react';

const PILLS = [
  { id: 'issue',  label: 'Create Issue',     icon: CircleDot,    color: 'text-emerald-600', bg: 'hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md hover:shadow-emerald-500/10' },
  { id: 'pat',    label: 'Create PAT Token', icon: Key,          color: 'text-amber-600',   bg: 'hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md hover:shadow-amber-500/10'   },
  { id: 'git',    label: 'Git',              icon: GitBranch,    color: 'text-violet-600',  bg: 'hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-500/10' },
  { id: 'pr',     label: 'Pull Request',     icon: GitPullRequest,color: 'text-blue-500',   bg: 'hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md hover:shadow-blue-500/10'    },
  { id: 'feed',   label: 'Feed',             icon: Rss,          color: 'text-gray-700',    bg: 'hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/80 hover:shadow-md hover:shadow-gray-500/10'    },
];

export default function ActionPills({ onPillClick }) {
  const [active, setActive] = useState(null);

  const handleClick = (id) => {
    setActive(id);
    onPillClick?.(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      className="flex items-center gap-2 flex-wrap"
    >
      {PILLS.map((pill, i) => {
        const Icon = pill.icon;
        const isActive = active === pill.id;

        return (
          <motion.button
            key={pill.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleClick(pill.id)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11.5px] font-semibold
              transition-all duration-200 cursor-pointer shadow-sm
              ${isActive
                ? `${pill.color} bg-gray-50 border-gray-300 shadow-md`
                : `text-gray-500 border-gray-200 bg-white ${pill.bg}`
              }
            `}
          >
            <Icon
              size={13}
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-colors duration-200 opacity-80"
            />
            {pill.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
