import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const [email,    setEmail]    = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const { register, loading, error } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    register(email, password, username)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-brand-500/10 border border-brand-500/20 mb-4">
            <Brain size={28} className="text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your mood journey</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20
                              text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="cooluser123" className="input-field" autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field" required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Password <span className="text-slate-600 font-normal">(min 6 chars)</span>
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" minLength={6}
                  className="input-field pr-12" required autoComplete="new-password"
                />
                <button
                  type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
