import React from 'react';

/**
 * IconBox — a small bordered container used for navbar icon buttons.
 * Provides consistent styling, hover effects, and click/mouse handlers.
 */
const IconBox = ({ children, onClick, onMouseEnter, onMouseLeave, className = '' }) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`cursor-pointer flex items-center justify-center p-1.5 rounded-md border border-gray-200 hover:border-gray-400 transition-all duration-200 bg-white text-black shadow-sm hover:shadow ${className}`}
  >
    {children}
  </div>
);

export default IconBox;
