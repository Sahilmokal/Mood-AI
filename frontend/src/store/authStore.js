import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, user) =>
        set({
          token,
          user
        }),

      logout: () => {
        set({
          token: null,
          user: null
        })

        window.location.href = '/login'
      }
    }),

    {
      name: 'moodrec-auth',

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
)