import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => { set({ token: null, user: null }); window.location.href = '/login' },
    }),
    { name: 'moodrec-auth', partialize: s => ({ token: s.token, user: s.user }) }
  )
)
