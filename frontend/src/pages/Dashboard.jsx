import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'

import { fetchRecommendations } from '../services/index'
import RecSection from '../components/recommendations/RecSection'
import { getMoodTheme } from '../utils/moods'

export default function Dashboard() {

  const { id } = useParams()
  const navigate = useNavigate()

  const currentMood =
    sessionStorage.getItem('currentMood') || 'neutral'

  const theme = getMoodTheme(currentMood)

  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {

    if (!id) return

    setLoading(true)
    setError(null)

    try {

      console.log('➡️ Fetching recommendations:', id)

      const data = await fetchRecommendations(id)

      console.log('✅ Recommendations:', data)

      setRecs(data)

    } catch (e) {

      console.error('❌ Dashboard error:', e)

      setError('Failed to load recommendations')

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    load()
  }, [id])

  return (

    <div
      className="min-h-screen relative overflow-hidden transition-all duration-700"
      style={{
        background: theme.bg,
        color: theme.text
      }}
    >

      {/* Animated background orbs */}

      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity
        }}
        className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px]
                   rounded-full blur-[120px] opacity-30"
        style={{
          background: theme.orb1
        }}
      />

      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity
        }}
        className="absolute bottom-[-120px] right-[-120px] w-[450px] h-[450px]
                   rounded-full blur-[120px] opacity-30"
        style={{
          background: theme.orb2
        }}
      />

      {/* Content */}

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl backdrop-blur-xl border transition-all"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow
            }}
          >
            <ArrowLeft />
          </button>

          <div className="text-center">

            <h1
              className="text-4xl font-bold mb-2"
              style={{
                color: theme.text
              }}
            >
              {currentMood.toUpperCase()} MODE
            </h1>

            <p className="opacity-70">
              Personalized recommendations based on your mood
            </p>

          </div>

          <button
            onClick={load}
            className="p-3 rounded-2xl backdrop-blur-xl border"
            style={{
              background: theme.card,
              borderColor: theme.border,
              boxShadow: theme.glow
            }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </button>

        </div>

        {/* Loading */}

        {loading && (

          <div className="flex items-center justify-center py-32">

            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: 'linear'
              }}
              className="w-20 h-20 rounded-full border-4 border-t-transparent"
              style={{
                borderColor: theme.border,
                borderTopColor: 'transparent'
              }}
            />

          </div>

        )}

        {/* Error */}

        {error && (

          <div
            className="p-6 rounded-3xl text-center"
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`
            }}
          >
            <p>{error}</p>
          </div>

        )}

        {/* Recommendations */}

        {!loading && recs && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <div
              className="p-6 rounded-[32px] backdrop-blur-2xl"
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.glow
              }}
            >

              <RecSection
                title="Movies"
                emoji="🎬"
                items={recs.movies || []}
              />

              <RecSection
                title="Music"
                emoji="🎵"
                items={recs.music || []}
              />

              <RecSection
                title="Activities"
                emoji="🏃"
                items={recs.activities || []}
              />

            </div>

          </motion.div>

        )}

      </div>

    </div>
  )
}