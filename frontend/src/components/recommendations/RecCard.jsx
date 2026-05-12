import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Info, Music, Film, Activity } from 'lucide-react'
import { feedbackService } from '../../services/index'

const TYPE_ICONS = { MOVIE: Film, MUSIC: Music, ACTIVITY: Activity }

const PLACEHOLDERS = {
  MOVIE:    'linear-gradient(135deg, #1e1e2e 0%, #16161f 100%)',
  MUSIC:    'linear-gradient(135deg, #0f1923 0%, #1a1230 100%)',
  ACTIVITY: 'linear-gradient(135deg, #0a1a0a 0%, #1a2a10 100%)',
}

const COLOR_MAP = {
  volt: '#c8ff00',
  aurora: '#00ffc8',
  rose: '#ff4f7b',
  amber: '#ffb830',
  violet: '#8b5cf6',
  blue: '#60a5fa',
  green: '#4ade80',
  dim: '#64648a',
}

export default function RecCard({ item, index, isFrontend = false }) {
  const [liked, setLiked] = useState(item.liked === true)
  const [disliked, setDisliked] = useState(item.liked === false)
  const [busy, setBusy] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const TypeIcon = TYPE_ICONS[item.type] || Film
  const accent = item.color ? (COLOR_MAP[item.color] || '#c8ff00') : '#c8ff00'

  const handleFeedback = async (reaction) => {
    if (busy || isFrontend) return
    setBusy(true)

    try {
      await feedbackService.submit(item.id, reaction)

      if (reaction === 'LIKE') {
        setLiked(true)
        setDisliked(false)
      }

      if (reaction === 'DISLIKE') {
        setLiked(false)
        setDisliked(true)
      }
    } catch (e) {
      console.warn('feedback error', e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card-dark overflow-hidden flex flex-col"
    >

      {/* MEDIA SECTION */}
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: PLACEHOLDERS[item.type] }}
      >

        {/* 🎵 MUSIC FIX */}
        {item.type === 'MUSIC' ? (
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex items-center justify-center text-white text-sm bg-black/40"
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
            <TypeIcon size={30} style={{ color: accent, opacity: 0.4 }} />
          </div>
        )}

        {/* TYPE BADGE */}
        <div className="absolute top-3 left-3 text-xs px-2 py-1 bg-black/60 rounded">
          {item.type}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        <h3 className="text-sm text-white">{item.title}</h3>

        {item.desc && (
          <p className="text-xs text-gray-400">{item.desc}</p>
        )}

        {/* 📍 MAP LINK */}
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
              <p className="text-xs text-gray-500">{item.reason}</p>
            )}
          </>
        )}

        <div className="flex-1" />

        {/* FEEDBACK */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFeedback('LIKE')}
            className="flex-1 text-xs border p-2"
          >
            👍 Like
          </button>

          <button
            onClick={() => handleFeedback('DISLIKE')}
            className="flex-1 text-xs border p-2"
          >
            👎 Skip
          </button>
        </div>
      </div>
    </motion.div>
  )
}