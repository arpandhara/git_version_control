import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { AVATAR_MAP } from './ProfileGlanceCard';
import apiClient from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';

const AVATAR_KEYS = Object.keys(AVATAR_MAP);
const BOY_KEYS    = AVATAR_KEYS.filter((k) => k.startsWith('boy'));
const GIRL_KEYS   = AVATAR_KEYS.filter((k) => k.startsWith('girl'));

const SWATCHES = [
  '#6d28d9', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#db2777', // pink
  '#475569', // slate
];

export default function CardEditModal({ isOpen, onClose, currentAvatarKey, currentCardColor, onPreviewChange }) {
  const { setUser } = useAuthStore();
  const [avatarKey, setAvatarKey]   = useState(currentAvatarKey);
  const [cardColor, setCardColor]   = useState(currentCardColor);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  useEffect(() => {
    if (onPreviewChange && isOpen) {
      onPreviewChange(avatarKey, cardColor);
    }
  }, [avatarKey, cardColor, isOpen, onPreviewChange]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch('/users/dashboard-card', { avatarKey, cardColor });
      setUser(res.data.data.user);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (err) {
      console.error('Failed to save dashboard card:', err);
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-50 bg-white rounded-2xl border border-gray-200 shadow-xl w-[300px] flex flex-col"
            style={{
              top: '72px',
              bottom: '16px',
              right: 'calc(16px + 256px + 24px)',
            }}
          >
            {/* ── Fixed Header ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-900">Customize your card</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {/* Avatar Picker */}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Choose Avatar
              </p>

              <div className="mb-5">
                <p className="text-[10px] text-gray-300 mb-1.5">Boys</p>
                <div className="flex gap-2 mb-3">
                  {BOY_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => setAvatarKey(key)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        avatarKey === key
                          ? 'border-violet-500 shadow-md shadow-violet-200'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                      style={{ background: avatarKey === key ? '#f5f3ff' : '#f8fafc' }}
                    >
                      <img
                        src={AVATAR_MAP[key]}
                        alt={key}
                        className="w-full h-full object-contain object-bottom p-1"
                      />
                      {avatarKey === key && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check size={8} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-gray-300 mb-1.5">Girls</p>
                <div className="flex gap-2">
                  {GIRL_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => setAvatarKey(key)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                        avatarKey === key
                          ? 'border-violet-500 shadow-md shadow-violet-200'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                      style={{ background: avatarKey === key ? '#f5f3ff' : '#f8fafc' }}
                    >
                      <img
                        src={AVATAR_MAP[key]}
                        alt={key}
                        className="w-full h-full object-contain object-bottom p-1"
                      />
                      {avatarKey === key && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check size={8} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-100 mb-4" />

              {/* Color Picker */}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                Card Color
              </p>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => setCardColor(swatch)}
                    className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: swatch,
                      boxShadow: cardColor === swatch ? `0 0 0 3px white, 0 0 0 5px ${swatch}` : 'none',
                      transform: cardColor === swatch ? 'scale(1.15)' : undefined,
                    }}
                  >
                    {cardColor === swatch && (
                      <Check size={10} strokeWidth={3} className="text-white" />
                    )}
                  </button>
                ))}

                {/* Custom color */}
                <label
                  className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
                  title="Custom color"
                >
                  <span className="text-[9px] font-bold text-gray-400">+</span>
                  <input
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>

              {/* Color preview swatch */}
              <div
                className="w-full h-8 rounded-lg transition-colors duration-200"
                style={{ background: `linear-gradient(90deg, ${cardColor}, ${cardColor}99)` }}
              />
            </div>

            {/* ── Sticky Save Button ── */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60"
                style={{ background: cardColor, color: 'white' }}
              >
                {saving
                  ? <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                  : saved
                  ? <><Check size={13} strokeWidth={2.5} /> Saved!</>
                  : 'Save changes'
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
