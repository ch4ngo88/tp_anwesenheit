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
import type { TooltipProps } from 'recharts'


interface Props {
  members: Member[]
  compact: boolean
}

/* ----------  Custom Tooltip  ---------- */
function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, percent, present, total, presentDates } = payload[0].payload
  return (
    <div
      tabIndex={0}
      onWheelCapture={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      className="bg-white border border-gray-200 rounded-xl shadow p-2 text-xs max-w-[180px]"
    >
      <div className="font-medium mb-1">{name}</div>
      <div className="mb-1">
        {present} von {total} Terminen ({percent}%)
      </div>
      {presentDates.length > 0 && (
        <ul className="list-disc list-inside max-h-28 overflow-y-auto space-y-0.5">
          {presentDates.map((d: string) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  )
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
        const presentEntries = entries.filter((e) => e.present)
        const present = presentEntries.length
        const percent = total ? Math.round((present / total) * 100) : 0
        return {
          name: m.name,
          percent,
          present,
          total,
          presentDates: presentEntries.map((e) => e.date),
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
              interval={0} // <- das ist der wichtige Teil

            tick={{ fontSize: compact ? 8 : 9, fill: '#374151' }}
          />
<Tooltip
  content={<CustomTooltip />}
  wrapperStyle={{ pointerEvents: 'auto' }}   // ← aktiviert Events
/>          <Bar dataKey="percent" radius={[6, 6, 6, 6]}>
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
