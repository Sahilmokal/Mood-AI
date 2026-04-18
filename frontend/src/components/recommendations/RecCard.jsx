import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Info } from 'lucide-react'
import { feedbackService } from '../../services/recommendationService'

export default function RecCard({ item, index }) {
  const [liked,    setLiked]    = useState(item.liked === true)
  const [disliked, setDisliked] = useState(item.liked === false)
  const [showReason, setShowReason] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFeedback = async (reaction) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await feedbackService.submit(item.id, reaction)
      if (reaction === 'LIKE')    { setLiked(true);  setDisliked(false) }
      if (reaction === 'DISLIKE') { setDisliked(true); setLiked(false)  }
    } catch (e) {
      console.error('Feedback error:', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden
                 hover:border-slate-700 transition-all duration-200 group"
    >
      {/* Poster image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-800">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full
                           bg-black/60 text-slate-300 backdrop-blur-sm">
            {item.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-100 text-sm leading-tight mb-3 line-clamp-2">
          {item.title}
        </h3>

        {/* Why recommended (toggleable) */}
        {item.reason && (
          <div className="mb-3">
            <button
              onClick={() => setShowReason(v => !v)}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300"
            >
              <Info size={12} />
              {showReason ? 'Hide reason' : 'Why recommended?'}
            </button>
            {showReason && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-slate-400 mt-2 leading-relaxed"
              >
                {item.reason}
              </motion.p>
            )}
          </div>
        )}

        {/* Like / Dislike */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback('LIKE')}
            disabled={submitting}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                        text-sm font-medium transition-all duration-200
                        ${liked
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-green-400 hover:bg-green-500/10'}`}
          >
            <ThumbsUp size={14} /> Like
          </button>
          <button
            onClick={() => handleFeedback('DISLIKE')}
            disabled={submitting}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                        text-sm font-medium transition-all duration-200
                        ${disliked
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            <ThumbsDown size={14} /> Dislike
          </button>
        </div>
      </div>
    </motion.div>
  )
}
