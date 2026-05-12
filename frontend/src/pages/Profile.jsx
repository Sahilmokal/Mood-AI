import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, Layers, Target } from 'lucide-react'
import { historyService } from '../services/index'
import MoodGraph from '../components/history/MoodGraph'
import { getMood } from '../utils/moods'

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="card-dark p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="font-mono text-xs text-dim">{label}</p>
        <p className="font-display font-bold text-xl text-snow">{value}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try { setData(await historyService.get(0, 50)) }
    catch (e) { setError('Failed to load history') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const topMood = data?.moodCounts
    ? Object.entries(data.moodCounts).sort((a,b) => b[1]-a[1])[0]?.[0]
    : null
  const topCfg = topMood ? getMood(topMood) : null

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">your journey</p>
          <h1 className="font-display font-bold text-2xl text-snow">Mood History</h1>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2.5 rounded-xl border border-border text-dim
                     hover:text-soft transition-all disabled:opacity-40">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="card-dark p-6 text-center mb-6">
          <p className="text-rose font-mono text-sm mb-3">{error}</p>
          <button onClick={load} className="btn-ghost mx-auto">Retry</button>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_,i) => (
              <div key={i} className="h-20 bg-panel border border-border rounded-2xl" />
            ))}
          </div>
          <div className="h-72 bg-panel border border-border rounded-2xl" />
        </div>
      )}

      {!loading && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat icon={Layers}    label="Total Sessions" value={data.totalSessions} accent="#c8ff00" />
            <Stat icon={TrendingUp} label="Moods Tracked"  value={Object.keys(data.moodCounts||{}).length} accent="#00ffc8" />
            <Stat icon={Target}    label="Top Mood"
              value={topCfg ? `${topCfg.emoji} ${topCfg.label}` : '—'} accent="#8b5cf6" />
          </div>

          {/* Graph */}
          <div className="card-dark p-6">
            <h2 className="font-display font-semibold text-snow mb-6">Confidence Over Time</h2>
            <MoodGraph history={data.moodHistory} />
          </div>

          {/* Mood breakdown */}
          {data.moodCounts && Object.keys(data.moodCounts).length > 0 && (
            <div className="card-dark p-6">
              <h2 className="font-display font-semibold text-snow mb-6">Mood Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(data.moodCounts).sort((a,b) => b[1]-a[1]).map(([mood, count]) => {
                  const cfg = getMood(mood)
                  const pct = Math.round((count / data.totalSessions) * 100)
                  return (
                    <div key={mood} className="flex items-center gap-4">
                      <span className="text-xl w-7 text-center">{cfg.emoji}</span>
                      <span className="font-body text-sm text-soft w-20 capitalize">{cfg.label}</span>
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${cfg.color}60, ${cfg.color})` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-dim w-10 text-right">{pct}%</span>
                      <span className="font-mono text-xs text-dim w-6 text-right opacity-50">{count}×</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div className="card-dark p-6">
            <h2 className="font-display font-semibold text-snow mb-6">Recent Sessions</h2>
            {data.moodHistory.length === 0 ? (
              <p className="font-mono text-xs text-dim text-center py-8">
                No sessions yet. Analyse your mood to get started!
              </p>
            ) : (
              <div className="space-y-1">
                {data.moodHistory.slice(0, 25).map((entry, i) => {
                  const cfg  = getMood(entry.mood)
                  const date = new Date(entry.createdAt)
                  return (
                    <motion.div key={entry.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 px-3 py-3 rounded-xl
                                 hover:bg-surface transition-colors group">
                      <span className="text-xl">{cfg.emoji}</span>
                      <div className="flex-1">
                        <p className="font-display text-sm font-medium"
                           style={{ color: cfg.color }}>{cfg.label}</p>
                        <p className="font-mono text-xs text-dim">
                          {entry.source} · {Math.round(entry.confidence * 100)}% confidence
                        </p>
                      </div>
                      <time className="font-mono text-xs text-dim whitespace-nowrap">
                        {date.toLocaleDateString('en-IN', {
                          day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
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
