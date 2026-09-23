import { create } from 'zustand';
import apiClient from '../lib/axios';

const useAuthStore = create((set) => ({
  user: null,
  isInitializing: true,
  
  fetchUser: async () => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      set({ user: null, isInitializing: false });
      return null;
    }
    try {
      const response = await apiClient.get('/users/me');
      localStorage.setItem('isAuthenticated', 'true');
      set({ user: response.data.data.user, isInitializing: false });
      return response.data.data.user;
    } catch (error) {
      localStorage.removeItem('isAuthenticated');
      set({ user: null, isInitializing: false });
      return null;
    }
  },

  clearUser: () => {
    localStorage.removeItem('isAuthenticated');
    set({ user: null });
  },

  setUser: (user) => {
    set({ user });
  }
}));

export default useAuthStore;
