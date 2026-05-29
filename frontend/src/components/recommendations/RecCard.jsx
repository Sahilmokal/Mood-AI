import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp,
  ThumbsDown,
  Info,
  Music,
  Film,
  Activity,
  CheckCircle2
} from 'lucide-react'

import { feedbackService } from '../../services/index'

const TYPE_ICONS = {
  MOVIE: Film,
  MUSIC: Music,
  ACTIVITY: Activity
}

const PLACEHOLDERS = {
  MOVIE: 'linear-gradient(135deg, #1e1e2e 0%, #16161f 100%)',
  MUSIC: 'linear-gradient(135deg, #0f1923 0%, #1a1230 100%)',
  ACTIVITY: 'linear-gradient(135deg, #0a1a0a 0%, #1a2a10 100%)',
}

export default function RecCard({
  item,
  index,
  isFrontend = false,
  onSkip
}) {

  const [liked, setLiked] = useState(item.liked === true)
  const [disliked, setDisliked] = useState(item.liked === false)

  const [busy, setBusy] = useState(false)

  const [showInfo, setShowInfo] = useState(false)

  const [toast, setToast] = useState('')

  const TypeIcon = TYPE_ICONS[item.type] || Film

  const handleFeedback = async (reaction) => {

    if (busy || isFrontend) return

    setBusy(true)

    try {

      console.log('📤 Sending feedback:', item.id, reaction)

      const res = await feedbackService.submit(item.id, reaction)

      console.log('✅ Feedback response:', res)

      // LIKE
      if (reaction === 'LIKE') {

        setLiked(true)
        setDisliked(false)

        setToast('Added to your preferences')

        setTimeout(() => {
          setToast('')
        }, 2000)
      }

      // DISLIKE
      if (reaction === 'DISLIKE') {

        setLiked(false)
        setDisliked(true)

        setToast('Recommendation skipped')

        setTimeout(() => {

          if (onSkip) {
            onSkip(item.id)
          }

        }, 600)
      }

    } catch (e) {

      console.error('❌ feedback error:', e)

      setToast('Failed to save feedback')

    } finally {

      setBusy(false)
    }
  }

  return (

    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.8,
        x: -100
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.35
      }}
      className="card-dark overflow-hidden flex flex-col"
    >

      {/* IMAGE */}

      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background: PLACEHOLDERS[item.type]
        }}
      >

        {item.type === 'MUSIC' ? (

          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex items-center justify-center
                       text-white text-sm bg-black/40"
          >
            ▶ Play on YouTube
          </a>

        ) : item.imageUrl ? (

          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="absolute inset-0 flex items-center justify-center">
            <TypeIcon
              size={30}
              style={{
                color: '#c8ff00',
                opacity: 0.4
              }}
            />
          </div>

        )}

        {/* TYPE */}

        <div className="absolute top-3 left-3 text-xs px-2 py-1 bg-black/60 rounded">
          {item.type}
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-4 flex flex-col gap-2 flex-1">

        <h3 className="text-sm text-white">
          {item.title}
        </h3>

        {item.desc && (
          <p className="text-xs text-gray-400">
            {item.desc}
          </p>
        )}

        {item.mapUrl && (
          <a
            href={item.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 underline"
          >
            Explore Nearby →
          </a>
        )}

        {/* WHY */}

        {item.reason && (
          <>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs text-gray-400"
            >
              why this?
            </button>

            {showInfo && (
              <p className="text-xs text-gray-500">
                {item.reason}
              </p>
            )}
          </>
        )}

        {/* TOAST */}

        <AnimatePresence>

          {toast && (

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2
                         text-xs text-green-400 mt-1"
            >
              <CheckCircle2 size={14} />
              {toast}
            </motion.div>

          )}

        </AnimatePresence>

        <div className="flex-1" />

        {/* BUTTONS */}

        <div className="flex gap-2">

          <button
            disabled={busy}
            onClick={() => handleFeedback('LIKE')}
            className={`flex-1 text-xs border p-2 rounded-xl transition
              ${liked
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'border-white/10 hover:border-green-400'
              }`}
          >
            👍 Like
          </button>

          <button
            disabled={busy}
            onClick={() => handleFeedback('DISLIKE')}
            className={`flex-1 text-xs border p-2 rounded-xl transition
              ${disliked
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'border-white/10 hover:border-red-400'
              }`}
          >
            👎 Skip
          </button>

        </div>

      </div>

    </motion.div>
  )
}