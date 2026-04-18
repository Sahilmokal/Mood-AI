import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,   // { email, username }

      setAuth: (token, user) => set({ token, user }),

      logout: () => {
        set({ token: null, user: null })
        window.location.href = '/login'
      },
    }),
    {
      name: 'moodrec-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
