import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Target, RefreshCw } from 'lucide-react'
import { historyService } from '../services/recommendationService'
import MoodGraph from '../components/history/MoodGraph'
import { MOOD_CONFIG } from '../components/mood/MoodResult'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const result = await historyService.getHistory(0, 50)
      setData(result)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const topMood = data?.moodCounts
    ? Object.entries(data.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null
  const topCfg = topMood ? (MOOD_CONFIG[topMood] || MOOD_CONFIG.neutral) : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Your Mood History</h1>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400
                     hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="card text-red-400 text-center mb-6">
          <p>{error}</p>
          <button onClick={load} className="btn-secondary mt-3 mx-auto">Retry</button>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      )}

      {!loading && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={Calendar}
              label="Total Sessions"
              value={data.totalSessions}
              color="bg-brand-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Moods Tracked"
              value={Object.keys(data.moodCounts || {}).length}
              color="bg-teal-600"
            />
            <StatCard
              icon={Target}
              label="Top Mood"
              value={topCfg ? `${topCfg.emoji} ${topCfg.label}` : '—'}
              color="bg-purple-600"
            />
          </div>

          {/* Confidence over time graph */}
          <div className="card">
            <h2 className="section-title mb-6">Confidence Over Time</h2>
            <MoodGraph history={data.moodHistory} />
          </div>

          {/* Mood distribution */}
          {data.moodCounts && Object.keys(data.moodCounts).length > 0 && (
            <div className="card">
              <h2 className="section-title mb-5">Mood Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(data.moodCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const cfg = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral
                    const pct = Math.round((count / data.totalSessions) * 100)
                    return (
                      <div key={mood} className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{cfg.emoji}</span>
                        <span className="text-slate-300 text-sm w-24 capitalize">{cfg.label}</span>
                        <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full rounded-full ${cfg.color.replace('text-', 'bg-')}`}
                          />
                        </div>
                        <span className="text-slate-500 text-sm w-12 text-right">{pct}%</span>
                        <span className="text-slate-600 text-xs w-6">{count}x</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Recent history list */}
          <div className="card">
            <h2 className="section-title mb-5">Recent Sessions</h2>
            {data.moodHistory.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No sessions yet. Analyze your mood to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {data.moodHistory.slice(0, 20).map((entry, i) => {
                  const cfg = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.neutral
                  const date = new Date(entry.createdAt)
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-3 rounded-xl
                                 hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-xl">{cfg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${cfg.color} capitalize`}>
                          {cfg.label}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {entry.source} · {Math.round(entry.confidence * 100)}% confidence
                        </p>
                      </div>
                      <time className="text-slate-500 text-xs whitespace-nowrap">
                        {date.toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </time>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
