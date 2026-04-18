import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

const MOOD_COLORS = {
  happy: '#facc15', sad: '#60a5fa', angry: '#f87171',
  stressed: '#fb923c', calm: '#2dd4bf', neutral: '#94a3b8',
  fearful: '#c084fc', surprised: '#22d3ee', energetic: '#fbbf24',
}

export default function MoodGraph({ history = [] }) {
  const chartData = useMemo(() =>
    history.slice().reverse().map(h => ({
      date:       format(new Date(h.createdAt), 'MMM d'),
      mood:       h.mood,
      confidence: Math.round(h.confidence * 100),
    })), [history])

  if (!chartData.length) return (
    <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
      No mood history yet — analyze your mood to get started!
    </div>
  )

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155',
                            borderRadius: '12px', fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v, n, p) => [`${v}%`, `Confidence`]}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `${label} — ${payload[0].payload.mood}` : label}
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#3b5bdb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#3b5bdb', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#567eff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
