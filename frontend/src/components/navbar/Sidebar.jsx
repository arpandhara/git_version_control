import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, CircleDot, GitPullRequest, Book, Terminal, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onClose }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking outside the sidebar AND not on the hamburger button
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('[data-hamburger]')
      ) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const topRepos = [
    { name: 'arpandhara/RedGrid', color: 'bg-red-500' },
    { name: 'Auratechlabs/auraportfolio', color: 'bg-orange-400' },
    { name: 'Auratechlabs/farmcult', color: 'bg-orange-500' },
    { name: 'BSKF/bskf', color: 'bg-green-400' },
    { name: 'arpandhara/mini_banking_system...', color: 'bg-red-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`fixed left-2 top-[64px] bottom-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl z-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-sans pb-6 transition-[width] duration-300 ease-in-out ${
            isHovered ? 'w-72' : 'w-[68px]'
          }`}
        >
          <div className="py-5 px-3 flex flex-col gap-1.5">
            <SidebarItem icon={Home} label="Home" isExpanded={isHovered} onClick={() => navigate('/dashboard')} />
            <SidebarItem icon={CircleDot} label="All issues" isExpanded={isHovered} />
            <SidebarItem icon={GitPullRequest} label="All pull requests" isExpanded={isHovered} />
            <SidebarItem icon={Book} label="All repositories" isExpanded={isHovered} />
            <SidebarItem icon={Terminal} label="Codespaces" isExpanded={isHovered} onClick={() => window.open('/ide', '_blank')} />
          </div>

          <div className="w-full h-px bg-gray-100 my-2"></div>

          <div className={`px-3 py-2 mt-2 flex items-center overflow-hidden ${isHovered ? 'justify-between' : 'justify-center'}`}>
            <span className={`text-xs font-bold tracking-wide text-gray-400 uppercase whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Top repositories
            </span>
            <button className="hover:bg-gray-100 p-1.5 rounded-md transition-colors text-gray-500 hover:text-gray-900 flex-shrink-0" title="Search repositories">
              <Search size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="px-3 flex flex-col gap-1.5 mt-1">
            {topRepos.map((repo, idx) => (
              <button
                key={idx}
                className="group flex items-center w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700 text-left border border-transparent hover:border-gray-200 hover:shadow-sm overflow-hidden cursor-pointer"
                title={!isHovered ? repo.name : undefined}
              >
                <div className="w-5 flex justify-center flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${repo.color} shadow-inner`} />
                </div>
                <span className={`truncate font-medium whitespace-nowrap ml-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  {repo.name}
                </span>
              </button>
            ))}
            
            {isHovered && (
              <button className="text-xs font-semibold text-gray-400 px-3 py-2 text-left hover:text-gray-800 transition-colors mt-2 w-full cursor-pointer">
                Show more
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SidebarItem({ icon: Icon, label, isExpanded, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="group flex items-center w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700 text-left border border-transparent hover:border-gray-200 hover:shadow-sm overflow-hidden cursor-pointer"
      title={!isExpanded ? label : undefined}
    >
      <div className="w-5 flex justify-center flex-shrink-0">
        <Icon size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.8} />
      </div>
      <span className={`font-medium whitespace-nowrap ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
    </button>
  );
}
