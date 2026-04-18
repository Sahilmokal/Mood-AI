import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MOOD_CONFIG = {
  happy:     { emoji: '😊', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Happy' },
  sad:       { emoji: '😢', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   label: 'Sad' },
  angry:     { emoji: '😠', color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Angry' },
  stressed:  { emoji: '😰', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Stressed' },
  fearful:   { emoji: '😨', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'Fearful' },
  surprised: { emoji: '😲', color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20',   label: 'Surprised' },
  disgusted: { emoji: '😒', color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'Disgusted' },
  calm:      { emoji: '😌', color: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/20',   label: 'Calm' },
  energetic: { emoji: '⚡', color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  label: 'Energetic' },
  neutral:   { emoji: '😐', color: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20',  label: 'Neutral' },
}

export default function MoodResult({ moodResult, moodHistoryId }) {
  const navigate  = useNavigate()
  const cfg       = MOOD_CONFIG[moodResult?.mood] || MOOD_CONFIG.neutral
  const pct       = Math.round((moodResult?.confidence || 0) * 100)

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="card max-w-md mx-auto text-center"
    >
      {/* Mood emoji + badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
        className={`inline-flex items-center justify-center w-24 h-24 rounded-full
                    text-5xl mb-4 ${cfg.bg} border-2 ${cfg.border}`}
      >
        {cfg.emoji}
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-1">
        We detected you're feeling
      </h2>
      <p className={`text-4xl font-extrabold mb-2 ${cfg.color}`}>
        {cfg.label}
      </p>
      <p className="text-slate-400 text-sm mb-6">
        Source: <span className="text-slate-300 font-medium">{moodResult?.source}</span>
      </p>

      {/* Confidence bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Confidence</span>
          <span className={`font-semibold ${cfg.color}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${cfg.bg.replace('bg-', 'bg-').replace('/10', '')}
                        ${cfg.color.replace('text-', 'bg-')}`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary flex-1"
        >
          <RefreshCw size={16} /> Try Again
        </button>
        <button
          onClick={() => navigate(`/dashboard/${moodHistoryId}`)}
          className="btn-primary flex-1"
        >
          See Recommendations <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

export { MOOD_CONFIG }
