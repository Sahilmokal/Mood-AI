import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    try {
      await login(email, password)
    } catch (err) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-5 py-12">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-4"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-volt flex items-center justify-center">
            <Zap size={18} className="text-ink fill-ink" />
          </div>
          <span className="font-display font-bold text-snow text-xl">MoodRec</span>
        </div>

        <h1 className="text-3xl text-snow font-bold">Sign In</h1>

        {error && (
          <div className="text-rose text-sm bg-rose/10 p-3 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-dark"
          required
        />

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark pr-10"
            required
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-volt w-full py-3"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-dim">
          New here? <Link to="/register" className="text-volt">Create account</Link>
        </p>
      </motion.form>
    </div>
  )
}