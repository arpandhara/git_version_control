import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TopRepos from '../components/dashboard/TopRepos';
import AskBox from '../components/dashboard/AskBox';
import ActionPills from '../components/dashboard/ActionPills';
import FeedSection from '../components/dashboard/FeedSection';
import ProfileGlance from '../components/dashboard/ProfileGlance';

export default function Dashboard() {
  const [activePill, setActivePill] = useState(null);
  const navigate = useNavigate();

  const handlePillClick = (id) => {
    if (id === 'pat') {
      navigate('/profile?tab=tokens&action=new');
    } else {
      setActivePill(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex w-full px-3 py-6 gap-6 font-sans min-h-screen"
    >
      {/* ══ LEFT — Top Repos ══ */}
      <TopRepos />

      {/* ══ CENTER — Ask Box + Pills + Feed ══ */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <AskBox />
        <ActionPills onPillClick={handlePillClick} />

        {/* Thin divider between pills and feed */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <FeedSection activePill={activePill} />
      </div>

      {/* ══ RIGHT — Profile at a Glance ══ */}
      <ProfileGlance />
    </motion.div>
  );
}
