import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getMood } from '../../utils/moods'

export default function MoodGraph({ history = [] }) {
  const data = useMemo(() =>
    [...history].reverse().slice(-20).map(h => ({
      date:  new Date(h.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' }),
      mood:  h.mood,
      conf:  Math.round(h.confidence * 100),
      emoji: getMood(h.mood).emoji,
    })), [history])

  if (!data.length) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-dim">
      <span className="text-4xl opacity-30">📈</span>
      <span className="font-mono text-xs">No data yet — start analysing!</span>
    </div>
  )

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#1e1e2e" />
          <XAxis dataKey="date" tick={{ fill: '#64648a', fontSize: 10, fontFamily: 'DM Mono' }}
                 axisLine={false} tickLine={false} />
          <YAxis domain={[0,100]} tick={{ fill: '#64648a', fontSize: 10, fontFamily: 'DM Mono' }}
                 axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#111118', border: '1px solid #1e1e2e',
                            borderRadius: '12px', fontFamily: 'DM Mono', fontSize: 11 }}
            labelStyle={{ color: '#9898b8' }}
            formatter={(v, _, p) => [`${v}%`, p.payload.emoji + ' ' + p.payload.mood]}
          />
          <Line type="monotone" dataKey="conf" stroke="#c8ff00" strokeWidth={2}
                dot={{ r: 3, fill: '#c8ff00', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#c8ff00', boxShadow: '0 0 12px #c8ff0080' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
