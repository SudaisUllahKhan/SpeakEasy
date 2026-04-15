'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ScorePoint {
  date: string
  pronunciation: number
  fluency: number
  comprehension: number
}

interface ScoreChartProps {
  data: ScorePoint[]
}

export function ScoreChart({ data }: ScoreChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : String(value))}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="pronunciation" stroke="#1E56A0" strokeWidth={2} dot={false} name="Pronunciation" />
        <Line type="monotone" dataKey="fluency" stroke="#10b981" strokeWidth={2} dot={false} name="Fluency" />
        <Line type="monotone" dataKey="comprehension" stroke="#f59e0b" strokeWidth={2} dot={false} name="Comprehension" />
      </LineChart>
    </ResponsiveContainer>
  )
}
