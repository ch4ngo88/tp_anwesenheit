import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts'
import { useMemo } from 'react'
import { useWindowSize } from '../hooks/useWindowSize'
import type { Member } from '../types/member'

interface Props {
  members: Member[]
  compact: boolean
}

export default function Chart({ members, compact }: Props) {
  const { height: vpHeight } = useWindowSize()

  /* ----------  Datenaufbereitung  ---------- */
  const allDates = useMemo(
    () => Array.from(new Set(members.flatMap((m) => m.attendance.map((a) => a.date)))).sort(),
    [members]
  )

  const rawData = useMemo(
    () =>
      members.map((m) => {
        const relevant = allDates.filter((d) => d >= m.joined)
        const entries = m.attendance.filter((a) => relevant.includes(a.date))
        const total = relevant.length
        const present = entries.filter((e) => e.present).length
        const percent = total ? Math.round((present / total) * 100) : 0
        return { name: m.name, percent, present, total }
      }),
    [members, allDates]
  )

  const data = useMemo(() => rawData.sort((a, b) => b.percent - a.percent), [rawData])

  /* ----------  Dynamische Höhenberechnung  ---------- */
  const headerReserve = compact ? 4 : 56 // kaum Platzabzug im Compact-Modus
  const freeHeight = Math.max(vpHeight - headerReserve, 300)
  const barHeight = Math.max(10, Math.floor((freeHeight - 60) / data.length))
  const chartHeight = barHeight * data.length + 60

  /* ----------  Farben  ---------- */
  const getColor = (p: number) => (p >= 70 ? '#22c55e' : p <= 30 ? '#ef4444' : '#facc15')

  /* ----------  Render  ---------- */
  return (
    <div className="w-full bg-white rounded-2xl shadow-md" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height={chartHeight - 10}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: compact ? 8 : 16, bottom: 0, left: compact ? 70 : 90 }}
          barSize={barHeight - 2}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={compact ? 70 : 90}
            tick={{ fontSize: compact ? 8 : 9, fill: '#374151' }}
          />
          <Tooltip
            formatter={(v: number, _n, props) => {
              const it = props.payload as any
              return [`${v}%`, `${it.present}x anwesend von ${it.total} Terminen`]
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              fontSize: 12,
              color: '#111827',
              padding: '6px 10px',
            }}
          />
          <Bar dataKey="percent" radius={[6, 6, 6, 6]}>
            {data.map((d) => (
              <Cell key={d.name} fill={getColor(d.percent)} />
            ))}
            <LabelList
              dataKey="percent"
              position="insideRight"
              formatter={(v: number) => `${v}%`}
              style={{ fill: '#1f2937', fontWeight: 600, fontSize: compact ? 8 : 9 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
