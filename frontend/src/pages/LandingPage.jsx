import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import MoodInput from '../components/mood/MoodInput'
import { useAuthStore } from '../store/authStore'
import { getMood } from '../utils/moods'

const FLOATING_MOODS = ['😊','😢','😠','😰','😌','⚡','😲','😨']

export default function LandingPage() {
  const user = useAuthStore(s => s.user)
  const name = user?.username || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center
                    px-5 py-16 relative overflow-hidden">

      {/* Floating mood emojis in background */}
      {FLOATING_MOODS.map((e, i) => (
        <motion.div key={i}
          className="absolute text-3xl select-none pointer-events-none opacity-10"
          style={{ left: `${8 + i * 12}%`, top: `${15 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 8 - i, 0] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}>
          {e}
        </motion.div>
      ))}

      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-2xl relative z-10">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                     bg-volt/10 border border-volt/20 mb-6">
          <Sparkles size={13} className="text-volt" />
          <span className="font-mono text-xs text-volt tracking-wider uppercase">
            AI mood detection
          </span>
        </motion.div>

        <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-snow
                       leading-[1.05] tracking-tight mb-4">
          Feel it.{' '}
          <span className="relative">
            <span className="text-volt">Find it.</span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-px bg-volt/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </span>
        </h1>

        <p className="font-body text-soft text-lg leading-relaxed">
          Hey {name} — tell me how you're feeling through text or your face,
          and I'll find the perfect movies, music & activities for your vibe.
        </p>
      </motion.div>

      {/* Main input */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-2xl relative z-10">
        <div className="card-glow p-7">
          <MoodInput />
        </div>
      </motion.div>

      {/* Feature row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mt-10 relative z-10">
        {[
          { icon: '🎬', label: 'Movies' },
          { icon: '🎵', label: 'YouTube Music' },
          { icon: '🏃', label: 'Activities' },
          { icon: '📊', label: 'Mood History' },
        ].map(f => (
          <div key={f.label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full
                       bg-surface border border-border text-dim text-sm font-body">
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
