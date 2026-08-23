import React, { useRef, useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import { GitPullRequest, User, FolderGit2, Star, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../lib/axios';
import { jsonToast } from '../lib/jsonToast';

import menuAnim from '../assets/Menu V4/menuV4.json';
import searchAnim from '../assets/Search to X/searchToX.json';
import plusAnim from '../assets/Plus to X/plusToX.json';
import folderAnim from '../assets/Folder/folder.json';
import notificationAnim from '../assets/NotificationV3/notification-V3.json';

const IconBox = ({ children, onClick, className = '' }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer flex items-center justify-center p-1.5 rounded-md border border-gray-200 hover:border-gray-400 transition-all duration-200 bg-white text-black shadow-sm hover:shadow ${className}`}
  >
    {children}
  </div>
);

const LottieIcon = ({ src, isToggle = true }) => {
  const lottieRef = useRef();
  const openRef = useRef(false);

  const handleClick = () => {
    const anim = lottieRef.current;
    if (!anim) return;

    if (isToggle) {
      if (!openRef.current) {
        // Play forward: closed → open
        anim.setDirection('forward');
        anim.stop();   // resets to frame 0
        anim.play();
        openRef.current = true;
      } else {
        // Play reverse: open → closed
        // Seek to the last frame first, then play backwards
        anim.setDirection('reverse');
        anim.stop();
        // Use the raw lottie-web instance to go to last frame
        if (anim.animationItem) {
          anim.animationItem.goToAndStop(anim.animationItem.totalFrames - 1, true);
        }
        anim.play();
        openRef.current = false;
      }
    } else {
      // One-shot: play forward once from frame 0
      anim.setDirection('forward');
      anim.stop();
      anim.play();
    }
  };

  return (
    <IconBox onClick={handleClick}>
      <Lottie
        lottieRef={lottieRef}
        src={src}
        loop={false}
        autoplay={false}
        style={{ width: 18, height: 18 }}
      />
    </IconBox>
  );
};

export default function Navbar() {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pfpRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      clearUser();
      setDropdownOpen(false);
      jsonToast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      jsonToast.error('Failed to logout');
    }
  };

  // Use the backend default PFP provided by the user, or fallback
  const defaultPfp = import.meta.env.VITE_DEFAULT_PFP_URL || 'https://res.cloudinary.com/do0st5xde/image/upload/v1787493034/defaultpfp.jpg';
  const profilePic = user?.profilePicture || defaultPfp;

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-transparent z-50 flex items-center justify-between px-4 font-sans text-black">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <LottieIcon src={menuAnim} isToggle={true} />
        {user && (
          <span className="font-semibold text-sm tracking-tight">
            {user.username}
          </span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search input placeholder styling from screenshot */}
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

        <LottieIcon src={plusAnim} isToggle={true} />

        <IconBox>
          <GitPullRequest size={15} strokeWidth={1.8} />
        </IconBox>

        <LottieIcon src={folderAnim} isToggle={false} />
        <LottieIcon src={notificationAnim} isToggle={false} />

        {/* Profile Picture + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            ref={pfpRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            className={`w-9 h-9 ml-1 rounded-full overflow-hidden border-2 cursor-pointer transition-all shadow-sm ${dropdownOpen ? 'border-gray-500 shadow' : 'border-gray-200 hover:border-gray-400'}`}
          >
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = defaultPfp }}
            />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-[60]"
              style={{ animation: 'dropdownFadeIn 0.15s ease-out' }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = defaultPfp }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.name || user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {[
                  { icon: User, label: 'Profile', action: () => {} },
                  { icon: FolderGit2, label: 'Repositories', action: () => {} },
                  { icon: Star, label: 'Stars', action: () => {} },
                  { icon: Settings, label: 'Settings', action: () => {} },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={() => { action(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Icon size={16} strokeWidth={1.8} className="text-gray-400" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-gray-100 pt-1 pb-0.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} strokeWidth={1.8} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown animation keyframes */}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
}
