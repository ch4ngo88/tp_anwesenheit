import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from 'recharts'
import { useWindowSize } from '../hooks/useWindowSize'
import type { Member } from '../types/member'

export type MemberStats = {
  name: string
  percent: number
  present: number
  total: number
  presentDates: string[]
  joined: string
}

interface Props {
  members: Member[]
  compact: boolean
  onSelect?: (m: MemberStats) => void
}

export default function Chart({ members, compact, onSelect }: Props) {
  const { height: vpHeight } = useWindowSize()

  /* ----------  Datenaufbereitung  ---------- */
  const allDates = useMemo(
    () => Array.from(new Set(members.flatMap((m) => m.attendance.map((a) => a.date)))).sort(),
    [members]
  )

  const rawData = useMemo<MemberStats[]>(
    () =>
      members.map((m) => {
        const relevant = allDates.filter((d) => d >= m.joined)
        const entries = m.attendance.filter((a) => relevant.includes(a.date))
        const total = relevant.length
        const presentEntries = entries.filter((e) => e.present)
        const present = presentEntries.length
        const percent = total ? Math.round((present / total) * 100) : 0
        return {
          name: m.name,
          percent,
          present,
          total,
          presentDates: presentEntries.map((e) => e.date),
          joined: m.joined,
        }
      }),
    [members, allDates]
  )

  const data = useMemo(() => rawData.sort((a, b) => b.percent - a.percent), [rawData])

  /* ----------  Dynamische Höhenberechnung  ---------- */
  const headerReserve = compact ? 4 : 56
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
          margin={{ top: 1, right: compact ? 8 : 16, bottom: 1, left: 0 }}
          barSize={barHeight - 2}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={64}
            interval={0}
            tick={{ fontSize: compact ? 8 : 9, fill: '#374151' }}
          />
          <Bar dataKey="percent" radius={[6, 6, 6, 6]}>
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={getColor(d.percent)}
                onClick={() => onSelect?.(d)}
                className="cursor-pointer"
              />
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
