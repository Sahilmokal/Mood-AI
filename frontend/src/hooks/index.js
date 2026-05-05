import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService, moodService } from '../services/index'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const setAuth   = useAuthStore(s => s.setAuth)
  const navigate  = useNavigate()

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const d = await authService.login({ email, password })
      setAuth(d.token, { email: d.email, username: d.username })
      navigate('/')
    } catch (e) { setError(e.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  const register = async (email, password, username) => {
    setLoading(true); setError(null)
    try {
      const d = await authService.register({ email, password, username })
      setAuth(d.token, { email: d.email, username: d.username })
      navigate('/')
    } catch (e) { setError(e.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return { login, register, loading, error }
}

export function useMoodAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const navigate = useNavigate()

  const run = async (fn) => {
    setLoading(true); setError(null)
    try {
      const result = await fn()
      navigate(`/result/${result.moodHistoryId}`, { state: { moodResult: result } })
    } catch (e) { setError(e.response?.data?.message || e.message || 'Analysis failed') }
    finally { setLoading(false) }
  }

  return {
    analyzeText:     text          => run(() => moodService.analyzeText(text)),
    detectFace:      blob          => run(() => moodService.detectFace(blob)),
    analyzeCombined: (blob, text)  => run(() => moodService.analyzeCombined(blob, text)),
    loading, error,
  }
}
