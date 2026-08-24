import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import ProfileReadme from '../components/profile/ProfileReadme';

export default function Profile() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);

  const defaultPfp =
    import.meta.env.VITE_DEFAULT_PFP_URL ||
    'https://res.cloudinary.com/do0st5xde/image/upload/v1787493034/defaultpfp.jpg';
  const profilePic = user?.profilePicture || defaultPfp;

  return (
    <div className="flex w-full max-w-[1280px] mx-auto px-6 py-6 gap-6 font-sans">
      {/* ════════════════════════════════════════════
          LEFT SIDEBAR — Profile card
          ════════════════════════════════════════════ */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-[296px] flex-shrink-0"
      >
        {/* ── Avatar ── */}
        <div className="mb-4">
          <div className="w-[280px] h-[280px] rounded-full overflow-hidden shadow-md mx-auto transition-shadow hover:shadow-lg">
            <img
              src={profilePic}
              alt={user?.username || 'Profile'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = defaultPfp;
              }}
            />
          </div>
        </div>

        {/* ── Animate between view / edit modes ── */}
        <AnimatePresence mode="wait">
          {!editing ? (
            <ProfileView key="view" user={user} onEdit={() => setEditing(true)} />
          ) : (
            <ProfileEdit key="edit" user={user} onCancel={() => setEditing(false)} />
          )}
        </AnimatePresence>
      </motion.aside>

      {/* ════════════════════════════════════════════
          RIGHT CONTENT AREA — Placeholder for README / repos
          ════════════════════════════════════════════ */}
      <ProfileReadme user={user} />
    </div>
  );
}
