import React from 'react';

export const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export const inputClass =
  'w-full px-3 py-[7px] text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 placeholder-gray-300';

export const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2.5 text-[13px] text-gray-600 leading-snug">
    <Icon size={15} strokeWidth={1.6} className="text-gray-400 flex-shrink-0" />
    <span className="truncate">{children}</span>
  </div>
);

export const FieldLabel = ({ label, children }) => (
  <div>
    <label className="block text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);
