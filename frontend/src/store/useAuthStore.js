import { create } from 'zustand';
import apiClient from '../lib/axios';

const useAuthStore = create((set) => ({
  user: null,
  isInitializing: true,
  
  fetchUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      set({ user: response.data.data.user, isInitializing: false });
      return response.data.data.user;
    } catch (error) {
      set({ user: null, isInitializing: false });
      return null;
    }
  },

  clearUser: () => {
    set({ user: null });
  },

  setUser: (user) => {
    set({ user });
  }
}));

export default useAuthStore;
