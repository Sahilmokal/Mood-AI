import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const setAuth = useAuthStore(s => s.setAuth)
  const logout  = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const data = await authService.login({ email, password })
      setAuth(data.token, { email: data.email, username: data.username })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, username) => {
    setLoading(true); setError(null)
    try {
      const data = await authService.register({ email, password, username })
      setAuth(data.token, { email: data.email, username: data.username })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return { login, register, logout, loading, error }
}
