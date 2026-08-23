import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/axios';
import { jsonToast } from '../lib/jsonToast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/users/me');
        setUser(res.data.data.user);
      } catch (err) {
        navigate('/', { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      jsonToast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      jsonToast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md text-center">
        <h1 className="text-4xl font-serif mb-2 tracking-tight text-gray-900">Dashboard</h1>
        {user ? (
          <p className="text-gray-500 mb-8 font-medium">
            Welcome back, <span className="font-bold text-black">{user.name || user.username}</span>!
          </p>
        ) : (
          <p className="text-gray-500 mb-8 font-medium">Loading...</p>
        )}
        
        <button
          onClick={handleLogout}
          className="group w-full bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer h-12"
        >
          <span className='text-emerald-500'>$rusty</span>
          <span>Log out</span>
          <svg
            className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
