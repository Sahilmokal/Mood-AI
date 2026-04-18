import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { recommendationService } from '../services/recommendationService'
import RecSection from '../components/recommendations/RecSection'
import { MOOD_CONFIG } from '../components/mood/MoodResult'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-6 bg-slate-800 rounded-xl w-40 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="aspect-[3/2] bg-slate-800" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { moodHistoryId } = useParams()
  const navigate          = useNavigate()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const result = await recommendationService.getRecommendations(moodHistoryId)
      setData(result)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [moodHistoryId])

  const cfg = data ? (MOOD_CONFIG[data.mood] || MOOD_CONFIG.neutral) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400
                     hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        {cfg && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-3xl">{cfg.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Recommendations for your{' '}
                <span className={cfg.color}>{cfg.label}</span> mood
              </h1>
              <p className="text-slate-400 text-sm">
                Confidence: {Math.round((data?.confidence || 0) * 100)}%
              </p>
            </div>
          </motion.div>
        )}
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto p-2 rounded-xl hover:bg-slate-800 text-slate-400
                     hover:text-slate-200 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card mb-8 text-red-400 text-center">
          <p>{error}</p>
          <button onClick={load} className="btn-secondary mt-4 mx-auto">
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-10">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      )}

      {/* Recommendations */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <RecSection
            title="Movies for You"
            icon="🎬"
            items={data.recommendations?.movies}
          />
          <RecSection
            title="Music Picks"
            icon="🎵"
            items={data.recommendations?.music}
          />
          <RecSection
            title="Activities"
            icon="🏃"
            items={data.recommendations?.activities}
          />
          {!data.recommendations?.movies?.length &&
           !data.recommendations?.music?.length &&
           !data.recommendations?.activities?.length && (
            <div className="text-center text-slate-500 py-16">
              <p className="text-lg">No recommendations found yet.</p>
              <p className="text-sm mt-2">Make sure your API keys are configured.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
