import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { getMood } from '../../utils/moods'

export default function MoodDisplay({ moodResult, moodHistoryId }) {
  const navigate = useNavigate()
  const cfg = getMood(moodResult?.mood)
  const pct = Math.round((moodResult?.confidence || 0) * 100)
  sessionStorage.setItem('currentMood', moodResult?.mood)
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Big mood card */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="card-glow p-8 mb-6 text-center relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 50% 50%, ${cfg.color}40, transparent 70%)` }} />

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
          className="text-8xl mb-6 block mood-ring">
          {cfg.emoji}
        </motion.div>

        <p className="section-label mb-3">we detected</p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display font-extrabold text-5xl mb-2"
          style={{ color: cfg.color }}>
          {cfg.label}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="font-body text-dim text-sm mb-8">
          {cfg.desc} · via {moodResult?.source || 'TEXT'}
        </motion.p>

        {/* Confidence meter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs text-dim uppercase tracking-wider">
              confidence
            </span>
            <span className="font-display font-bold text-sm" style={{ color: cfg.color }}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex gap-3">
        <button onClick={() => navigate('/')} className="btn-ghost flex-1">
          <RefreshCw size={15} /> Try Again
        </button>
        <button
          onClick={() => navigate(`/dashboard/${moodHistoryId}`, { state: { mood: moodResult?.mood } })}
          className="btn-volt flex-1">
          See Picks <ArrowRight size={15} />
        </button>
      </motion.div>
    </div>
  )
}
