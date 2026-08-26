import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import ProfileGlanceCard from './ProfileGlanceCard';
import CardEditModal from './CardEditModal';

export default function ProfileGlance() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  // The actual saved values from the database
  const savedColor  = user?.dashboardCard?.cardColor  ?? '#6d28d9';
  const savedAvatar = user?.dashboardCard?.avatarKey  ?? 'boyAvatar1';

  // Local state for live preview while editing
  const [previewColor, setPreviewColor] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // If we are editing, show the preview. Otherwise, show the saved values.
  const displayColor = (editOpen && previewColor) ? previewColor : savedColor;
  const displayAvatar = (editOpen && previewAvatar) ? previewAvatar : savedAvatar;

  const handleOpenEdit = () => {
    setPreviewColor(savedColor);
    setPreviewAvatar(savedAvatar);
    setEditOpen(true);
  };

  return (
    <>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        className="w-[256px] flex-shrink-0 flex flex-col gap-4"
      >
        {/* Flip card */}
        <ProfileGlanceCard
          user={user}
          cardColor={displayColor}
          avatarKey={displayAvatar}
          onEditClick={handleOpenEdit}
        />

        {/* View full profile link */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-center gap-2 w-full py-2 text-[12.5px] font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 hover:shadow-sm transition-all duration-200 cursor-pointer group"
        >
          View full profile
          <ArrowRight
            size={12}
            strokeWidth={2}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </motion.aside>

      {/* Edit modal — rendered outside the aside so it can center correctly */}
      <CardEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        currentAvatarKey={savedAvatar}
        currentCardColor={savedColor}
        onPreviewChange={(ak, cc) => {
          setPreviewAvatar(ak);
          setPreviewColor(cc);
        }}
      />
    </>
  );
}
