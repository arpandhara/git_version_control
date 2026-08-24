import React, { useState } from 'react';
import { Lottie } from 'lottie-react';
import { GitPullRequest } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

// Extracted sub-components
import IconBox from './navbar/IconBox';
import LottieIcon from './navbar/LottieIcon';
import ProfileDropdown from './navbar/ProfileDropdown';
import Sidebar from './navbar/Sidebar';
import CreateDropdown from './navbar/CreateDropdown';

// Lottie animation sources
import menuAnim from '../assets/Menu V4/menuV4.json';
import searchAnim from '../assets/Search to X/searchToX.json';
import folderAnim from '../assets/Folder/folder.json';
import notificationAnim from '../assets/NotificationV3/notification-V3.json';

export default function Navbar() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 bg-transparent z-50 flex items-center justify-between px-4 font-sans text-black backdrop-blur-sm bg-white/50">
        {/* ── Left Section ── */}
        <div className="flex items-center gap-3">
          <div data-hamburger>
            <LottieIcon 
              src={menuAnim} 
              isToggle={true} 
              active={isSidebarOpen}
              onClick={(isOpen) => setIsSidebarOpen(isOpen)} 
            />
          </div>
          {user && (
            <span className="font-semibold text-sm tracking-tight">
              {user.username}
            </span>
          )}
        </div>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 text-xs hover:border-gray-400 focus-within:border-gray-400 focus-within:shadow transition-all shadow-sm">
            <Lottie
              src={searchAnim}
              loop={false}
              autoplay={false}
              style={{ width: 14, height: 14, opacity: 0.5, flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Type / to search"
              className="bg-transparent outline-none text-xs text-black placeholder-gray-400 w-32 focus:w-44 transition-all duration-200"
            />
          </div>

          {/* Separator */}
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

          {/* Action icons */}
          <CreateDropdown />

          <IconBox>
            <GitPullRequest size={15} strokeWidth={1.8} />
          </IconBox>

          <LottieIcon src={folderAnim} trigger="hover" />
          <LottieIcon src={notificationAnim} trigger="hover" />

          {/* Profile avatar & dropdown */}
          <ProfileDropdown />
        </div>
      </nav>

      {/* ── Sidebar Drawer ── */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
