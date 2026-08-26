import React from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Plus, Star, GitFork, Lock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { AVATAR_MAP } from './ProfileGlanceCard';
import boyAvatar1 from '../../assets/avatars/boyAvatar1.png';

const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  Shell:      '#89e051',
  Ruby:       '#701516',
};

// Placeholder repos — replace with API data when ready
const STUB_REPOS = [
  { name: 'git_version_control', lang: 'JavaScript', stars: 3, private: false },
  { name: 'mini_banking_system',  lang: 'Python',     stars: 1, private: false },
  { name: 'RedGrid',              lang: 'TypeScript',  stars: 5, private: false },
  { name: 'auraportfolio',        lang: 'JavaScript', stars: 2, private: false },
  { name: 'farmcult',             lang: 'JavaScript', stars: 0, private: true  },
  { name: 'BSKF_projectmanagement', lang: 'TypeScript', stars: 0, private: true },
];

function RepoRow({ repo, index, avatarSrc }) {

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer text-left"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={avatarSrc} alt="repo owner" className="w-4 h-4 rounded-full flex-shrink-0 object-cover bg-gray-200" />
        <span className="text-[12.5px] font-semibold text-gray-800 truncate group-hover:text-black transition-colors">
          {repo.name}
        </span>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
        {repo.stars > 0 && (
          <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
            <Star size={10} strokeWidth={1.8} />
            {repo.stars}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default function TopRepos() {
  const { user } = useAuthStore();
  
  const defaultPfp = import.meta.env.VITE_DEFAULT_PFP_URL || 'https://res.cloudinary.com/do0st5xde/image/upload/v1787493034/defaultpfp.jpg';
  const profilePic = user?.profilePicture || defaultPfp;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-[220px] flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">
          Top Repos
        </span>
        <button className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#2ea043] hover:bg-[#2c974b] border border-[#2ea043] px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm">
          <BookMarked size={11} strokeWidth={2.5} />
          New
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 mx-1">
        <input
          type="text"
          placeholder="Find a repository…"
          className="w-full px-3 py-1.5 text-[12px] text-gray-900 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-lg outline-none focus:border-gray-500 focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all"
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-2" />

      {/* Repo list */}
      <div className="flex flex-col gap-0.5">
        {STUB_REPOS.map((repo, i) => (
          <RepoRow key={repo.name} repo={repo} index={i} avatarSrc={profilePic} />
        ))}
      </div>

      <button className="mt-3 px-3 text-[11.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
        Show more
      </button>
    </motion.aside>
  );
}
