import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

const authStore = (set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    set({ token, isAuthenticated: !!token });
  },
  signOut: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    delete api.defaults.headers.common['Authorization'];
  },
  initialize: () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, isAuthenticated: true }); // Set authenticated immediately with token
      
      // Then fetch user data in background
      api.get('/auth/me')
        .then(response => {
          if (response.data.success) {
            set({ user: response.data.data });
          }
        })
        .catch(() => {
          // Don't clear auth state on failed /me request
          console.warn('Failed to fetch user data, but keeping session active');
        });
    }
  }
});

export const useAuthStore = create(
  persist(authStore, {
    name: 'auth-storage',
    partialize: (state) => ({
      token: state.token,
      user: state.user,
      isAuthenticated: state.isAuthenticated
    })
  })
);