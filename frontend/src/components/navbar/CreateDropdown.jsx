import React, { useRef, useState, useEffect } from 'react';
import { BookPlus, CircleDot, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LottieIcon from './LottieIcon';
import plusAnim from '../../assets/Plus to X/plusToX.json';

export default function CreateDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleItemClick = (path) => {
    setDropdownOpen(false);
    if (path) navigate(path);
  };

  const menuItems = [
    { icon: BookPlus, label: 'New repository', action: () => handleItemClick('/new/repository') },
    { icon: CircleDot, label: 'New issue', action: () => handleItemClick('/new/issue') },
    { icon: Key, label: 'New pat token', action: () => handleItemClick('/profile?tab=tokens&action=new') },
  ];

  return (
    <div className="relative flex items-center justify-center h-full" ref={dropdownRef}>
      <LottieIcon 
        src={plusAnim} 
        isToggle={true} 
        active={dropdownOpen}
        onClick={() => setDropdownOpen((prev) => !prev)} 
      />

      {dropdownOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-[60]"
          style={{ animation: 'dropdownFadeIn 0.15s ease-out' }}
        >
          <div className="py-1">
            {menuItems.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Icon size={16} strokeWidth={1.8} className="text-gray-400" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
