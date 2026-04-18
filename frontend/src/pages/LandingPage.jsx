import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import MoodInput from '../components/mood/MoodInput'
import { useAuthStore } from '../store/authStore'

export default function LandingPage() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-brand-500/10 border border-brand-500/20 text-brand-400
                        text-sm font-medium mb-6">
          <Sparkles size={14} />
          AI-Powered Mood Detection
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          What's your{' '}
          <span className="bg-gradient-to-r from-brand-400 to-cyan-400
                           bg-clip-text text-transparent">
            vibe today
          </span>
          ?
        </h1>
        <p className="text-slate-400 text-lg">
          {user?.username
            ? `Welcome back, ${user.username}! `
            : ''}
          Share how you're feeling — through text, your face, or both — and get
          personalized movies, music, and activity recommendations.
        </p>
      </motion.div>

      {/* Main input card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-xl"
      >
        <MoodInput />
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-wrap justify-center gap-3 mt-8"
      >
        {['🎬 Movies', '🎵 Music', '🏃 Activities', '📊 Mood History'].map(f => (
          <span key={f}
            className="px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700
                       text-slate-400 text-sm font-medium">
            {f}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
