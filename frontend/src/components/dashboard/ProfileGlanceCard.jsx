import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, MapPin, Building2, Clock, Users, Share2, Check } from 'lucide-react';

// Avatar imports
import boyAvatar1 from '../../assets/avatars/boyAvatar1.png';
import boyAvatar2 from '../../assets/avatars/boyAvatar2.png';
import boyAvatar3 from '../../assets/avatars/boyAvatar3.png';
import girlAvatar1 from '../../assets/avatars/girlAvatar1.png';
import girlAvatar2 from '../../assets/avatars/girlAvatar2.png';
import girlAvatar3 from '../../assets/avatars/girlAvatar3.png';

export const AVATAR_MAP = {
  boyAvatar1,
  boyAvatar2,
  boyAvatar3,
  girlAvatar1,
  girlAvatar2,
  girlAvatar3,
};

// Lightens a hex color for text overlay readability
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function lighten(hex, amount = 0.7) {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

// ── Front Face ───────────────────────────────────────────────
function CardFront({ user, cardColor, avatarKey }) {
  const avatarSrc = AVATAR_MAP[avatarKey] || boyAvatar1;

  // Split name into 1–3 word-chunks for the stacked poster text
  const nameWords = useMemo(() => {
    const raw = (user?.name || user?.username || 'YOU').toUpperCase();
    const parts = raw.split(/[\s_]+/).filter(Boolean);
    if (parts.length >= 2) return parts.slice(0, 3);
    const mid = Math.ceil(raw.length / 2);
    return [raw.slice(0, mid), raw.slice(mid)].filter(Boolean);
  }, [user?.name, user?.username]);

  // Font size — more aggressive scaling so long names always fit in ~52% width
  const chunkFontSize = useMemo(() => {
    const maxLen = Math.max(...nameWords.map((w) => w.length));
    if (maxLen <= 3) return 40;
    if (maxLen <= 4) return 34;
    if (maxLen <= 5) return 28;
    if (maxLen <= 6) return 24;
    if (maxLen <= 8) return 20;
    return 16;
  }, [nameWords]);

  const bgTint = useMemo(() => lighten(cardColor, 0.92), [cardColor]);

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden flex"
      style={{ background: bgTint }}
    >


      {/* Decorative circle — top-left */}
      <div
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: cardColor }}
      />

      {/* Avatar — bottom-anchored, left side */}
      <div className="absolute bottom-0 left-0 w-[75%] flex items-end justify-center pointer-events-none select-none">
        <img
          src={avatarSrc}
          alt="avatar"
          loading="lazy"
          className="w-full max-h-[98%] object-contain object-bottom drop-shadow-lg"
          draggable={false}
        />
      </div>

      {/* Right side — stacked word poster text, anchored to top, wider column */}
      <div className="absolute right-0 top-0 w-[52%] overflow-hidden flex flex-col items-start justify-start pt-7 pl-1 pr-2 gap-0 select-none">
        {nameWords.map((word, i) => (
          <span
            key={i}
            className="font-black leading-none tracking-tighter block"
            style={{
              fontSize: chunkFontSize,
              color: cardColor,
              opacity: i === 0 ? 1 : i === 1 ? 0.82 : 0.6,
              lineHeight: 1.05,
              wordBreak: 'break-all',
            }}
          >
            {word}
          </span>
        ))}
        {/* Decorative dot */}
        <div
          className="w-2.5 h-2.5 rounded-full mt-2 ml-0.5"
          style={{ background: cardColor, opacity: 0.55 }}
        />
      </div>

      {/* Username badge — bottom right */}
      <div className="absolute bottom-3 right-3">
        <span
          className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: lighten(cardColor, 0.82),
            color: cardColor,
            border: `1px solid ${lighten(cardColor, 0.7)}`,
          }}
        >
          @{user?.username}
        </span>
      </div>
    </div>
  );
}


// ── Back Face ────────────────────────────────────────────
function CardBack({ user, cardColor, onShare, shared }) {
  const locationStr = useMemo(() =>
    user?.location
      ? [user.location.city, user.location.country].filter(Boolean).join(', ')
      : null,
    [user?.location]
  );
  const joinDate = useMemo(() =>
    user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : null,
    [user?.createdAt]
  );

  const initial = (user?.name || user?.username || '?')[0].toUpperCase();

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col bg-white"
    >
      {/* Colored top band — thin, decorative */}
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${cardColor}, ${lighten(cardColor, 0.5)})` }} />

      {/* Header area with avatar initial + name */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        {/* Avatar initial circle */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-[18px]"
          style={{ background: lighten(cardColor, 0.88), color: cardColor }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-gray-900 leading-tight truncate">
            {user?.name || user?.username}
          </h2>
          <p className="text-[11px] font-medium truncate" style={{ color: cardColor }}>
            @{user?.username}
          </p>
        </div>
      </div>

      {/* Thin separator */}
      <div className="mx-5 h-px bg-gray-100 mb-3" />

      {/* Info rows */}
      <div className="flex flex-col gap-2 px-5 flex-1 text-[11.5px] text-gray-500">
        {user?.bio && (
          <p className="leading-relaxed line-clamp-2 text-gray-600">{user.bio}</p>
        )}
        {user?.organization && (
          <div className="flex items-center gap-2">
            <Building2 size={11} strokeWidth={1.7} style={{ color: cardColor }} />
            <span className="truncate">{user.organization}</span>
          </div>
        )}
        {locationStr && (
          <div className="flex items-center gap-2">
            <MapPin size={11} strokeWidth={1.7} style={{ color: cardColor }} />
            <span className="truncate">{locationStr}</span>
          </div>
        )}
        {joinDate && (
          <div className="flex items-center gap-2">
            <Clock size={11} strokeWidth={1.7} style={{ color: cardColor }} />
            <span>Joined {joinDate}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-0 mx-5 mt-3 mb-3">
        <div
          className="flex-1 flex flex-col items-center py-2 rounded-xl"
          style={{ background: lighten(cardColor, 0.93) }}
        >
          <span className="text-[15px] font-black" style={{ color: cardColor }}>
            {user?.followers?.length ?? 0}
          </span>
          <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">Followers</span>
        </div>
        <div className="w-2" />
        <div
          className="flex-1 flex flex-col items-center py-2 rounded-xl"
          style={{ background: lighten(cardColor, 0.93) }}
        >
          <span className="text-[15px] font-black" style={{ color: cardColor }}>
            {user?.following?.length ?? 0}
          </span>
          <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">Following</span>
        </div>
      </div>

      {/* Share button */}
      <div className="px-5 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]"
          style={{ background: cardColor, color: '#fff' }}
        >
          {shared
            ? <><Check size={12} strokeWidth={2.5} /> Copied!</>
            : <><Share2 size={12} strokeWidth={2} /> Share Profile</>
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Flip Card ───────────────────────────────────────────
export default function ProfileGlanceCard({ user, cardColor, avatarKey, onEditClick }) {
  const [flipped, setFlipped]   = useState(false);
  const [hovered, setHovered]   = useState(false);
  const [shared, setShared]     = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/profile`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${user?.name || user?.username}'s profile`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div
      className="relative w-full"
      style={{ perspective: '1000px', height: 320 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edit button — fades in on hover, only on front */}
      <AnimatePresence>
        {hovered && !flipped && (
          <motion.button
            key="edit-btn"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => { e.stopPropagation(); onEditClick(); }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm cursor-pointer transition-colors"
            style={{ background: lighten(cardColor, 0.9), color: cardColor, border: `1px solid ${lighten(cardColor, 0.7)}` }}
          >
            <Pencil size={10} strokeWidth={2.5} />
            Edit
          </motion.button>
        )}
      </AnimatePresence>

      {/* Card — click anywhere to flip */}
      <motion.div
        className="w-full h-full relative cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}>
          <CardFront user={user} cardColor={cardColor} avatarKey={avatarKey} />
        </div>

        {/* Back */}
        <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}>
          <CardBack user={user} cardColor={cardColor} onShare={handleShare} shared={shared} />
        </div>
      </motion.div>


    </div>
  );
}
