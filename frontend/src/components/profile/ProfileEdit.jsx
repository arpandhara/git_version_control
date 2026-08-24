import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Loader2, ChevronDown } from 'lucide-react';
import { genderOptions, inputClass, FieldLabel } from './ProfileShared';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from './ProfileIcons';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../lib/axios';
import { jsonToast } from '../../lib/jsonToast';

export default function ProfileEdit({ user, onCancel }) {
  const { setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    organization: user?.organization || '',
    locationCity: user?.location?.city || '',
    locationState: user?.location?.state || '',
    locationCountry: user?.location?.country || '',
    localTime: user?.localTime || '',
    socialInsta: user?.socialLinks?.find((s) => s.platform === 'insta')?.url || '',
    socialYoutube: user?.socialLinks?.find((s) => s.platform === 'youtube')?.url || '',
    socialLinkedin: user?.socialLinks?.find((s) => s.platform === 'linkedin')?.url || '',
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const socialLinks = [];
      if (form.socialInsta?.trim()) socialLinks.push({ platform: 'insta', url: form.socialInsta.trim() });
      if (form.socialYoutube?.trim()) socialLinks.push({ platform: 'youtube', url: form.socialYoutube.trim() });
      if (form.socialLinkedin?.trim()) socialLinks.push({ platform: 'linkedin', url: form.socialLinkedin.trim() });

      const location = {};
      if (form.locationCity?.trim()) location.city = form.locationCity.trim();
      if (form.locationState?.trim()) location.state = form.locationState.trim();
      if (form.locationCountry?.trim()) location.country = form.locationCountry.trim();

      const payload = {
        name: form.name?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        gender: form.gender || undefined,
        organization: form.organization?.trim() || undefined,
        location: Object.keys(location).length > 0 ? location : undefined,
        localTime: form.localTime?.trim() || undefined,
        socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
      };

      const res = await apiClient.patch('/users/profile', payload);
      setUser(res.data.data.user);
      jsonToast.success('Profile updated');
      onCancel(); // exit edit mode
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update profile';
      jsonToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <FieldLabel label="Name">
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Your name"
          className={inputClass}
        />
      </FieldLabel>

      <FieldLabel label="Bio">
        <textarea
          value={form.bio}
          onChange={handleChange('bio')}
          placeholder="Tell the world about yourself"
          rows={3}
          maxLength={500}
          className={`${inputClass} resize-none`}
        />
        <p className="text-[10.5px] text-gray-300 mt-1 text-right">
          {form.bio?.length || 0} / 500
        </p>
      </FieldLabel>

      <FieldLabel label="Pronouns">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`${inputClass} flex items-center justify-between cursor-pointer`}
          >
            <span className={form.gender ? 'text-gray-800' : 'text-gray-300'}>
              {form.gender || "Don't specify"}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, gender: '' }));
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Don't specify
                </button>
                {genderOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, gender: g }));
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${form.gender === g ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {g}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FieldLabel>

      <FieldLabel label="Company">
        <input
          type="text"
          value={form.organization}
          onChange={handleChange('organization')}
          placeholder="Company or organization"
          className={inputClass}
        />
      </FieldLabel>

      <FieldLabel label="Location">
        <div className="flex gap-2">
          <input
            type="text"
            value={form.locationCity}
            onChange={handleChange('locationCity')}
            placeholder="City"
            className={`${inputClass} flex-1`}
          />
          <input
            type="text"
            value={form.locationState}
            onChange={handleChange('locationState')}
            placeholder="State"
            className={`${inputClass} flex-1`}
          />
          <input
            type="text"
            value={form.locationCountry}
            onChange={handleChange('locationCountry')}
            placeholder="Country"
            className={`${inputClass} flex-1`}
          />
        </div>
      </FieldLabel>

      <FieldLabel label="Local time">
        <input
          type="text"
          value={form.localTime}
          onChange={handleChange('localTime')}
          placeholder="e.g. (GMT+05:30) Kolkata"
          className={inputClass}
        />
      </FieldLabel>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div>
        <p className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Social accounts
        </p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200/60 shadow-sm">
              <InstagramIcon size={14} />
            </div>
            <input
              type="url"
              value={form.socialInsta}
              onChange={handleChange('socialInsta')}
              placeholder="Instagram URL"
              className={`${inputClass} flex-1`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200/60 shadow-sm">
              <YoutubeIcon size={14} />
            </div>
            <input
              type="url"
              value={form.socialYoutube}
              onChange={handleChange('socialYoutube')}
              placeholder="YouTube URL"
              className={`${inputClass} flex-1`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-700 bg-gray-100 border border-gray-200/60 shadow-sm">
              <LinkedinIcon size={14} />
            </div>
            <input
              type="url"
              value={form.socialLinkedin}
              onChange={handleChange('socialLinkedin')}
              placeholder="LinkedIn URL"
              className={`${inputClass} flex-1`}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <Save size={14} strokeWidth={1.8} />
          )}
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          <X size={14} strokeWidth={1.8} />
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
