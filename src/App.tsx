import { useState, useCallback, useEffect } from 'react'
import { initialMembers } from './data/members'
import type { Member } from './types/member'
import AttendanceTable from './components/AttendanceTable'
import Chart, { type MemberStats } from './components/Chart'
import ExportControls from './components/ExportControls'
import logo from './assets/logo.jpg'
import { useWindowSize } from './hooks/useWindowSize'

/* ----------  Throttle Utility  ---------- */
export function throttleFn<A extends unknown[], R>(
  fn: (...args: A) => R,
  delay: number
): (...args: A) => void {
  let last = 0
  return (...args: A) => {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn(...args)
    }
  }
}

export default function App() {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const stored = localStorage.getItem('members')
      if (stored) {
        const data = JSON.parse(stored)
        if (Array.isArray(data)) return data as Member[]
      }
    } catch {
      /* ignore */
    }
    return initialMembers
  })

  const [mode, setMode] = useState<'training' | 'performances'>('training')
  const [editMode, setEditMode] = useState(false)
  const [selected, setSelected] = useState<MemberStats | null>(null)
  const { width } = useWindowSize()

  /* ----------  Mobile-Compact Logik  ---------- */
  const isCompact = width < 640 && !editMode // <sm und View-Mode

  /* ----------  Persistent Storage  ---------- */
  const save = useCallback(
    throttleFn((data: Member[]) => {
      localStorage.setItem('members', JSON.stringify(data))
    }, 500),
    []
  )

  useEffect(() => {
    if (members.length) save(members)
  }, [members, save])

  /* ----------  Render  ---------- */
  return (
    <div
      className={
        'relative min-h-screen bg-gray-100 text-gray-800 overflow-auto ' +
        (isCompact ? 'px-1 py-1' : 'px-2 py-3 sm:px-4 sm:py-4')
      }
    >
      {/* Info-Panel */}
      {selected && (
        <div
          className={
            'fixed z-30 w-[92vw] max-w-sm rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-4 ' +
            'max-h-[calc(100vh-5rem)] overflow-y-auto ' +
            (isCompact ? 'bottom-20 right-2' : 'bottom-4 right-4')
          }
        >
          <header className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm">{selected.name}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-black">
              ✕
            </button>
          </header>

          <p className="text-xs mb-1">
            Mitglied seit <span className="font-medium">{selected.joined}</span>
          </p>
          <p className="text-xs mb-2">
            {selected.present} von {selected.total} Terminen (
            <span className="font-medium">{selected.percent}%</span>)
          </p>

          <div className="max-h-52 overflow-y-auto pr-1">
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {selected.presentDates.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={
          isCompact
            ? 'fixed bottom-2 right-2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow'
            : 'flex items-center justify-between mb-3'
        }
      >
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full shadow-sm" />
          <h1 className="hidden xs:block font-semibold leading-tight text-sm">Anwesenheit</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((m) => (m === 'training' ? 'performances' : 'training'))}
            className="px-3 py-1.5 rounded bg-gray-500 text-white text-xs sm:text-sm"
          >
            {mode === 'training' ? 'Auftritte' : 'Training'}
          </button>

          <button
            onClick={() => setEditMode((v) => !v)}
            className={
              'px-3 py-1.5 rounded text-white text-xs sm:text-sm font-medium ' +
              (editMode ? 'bg-red-600' : 'bg-gray-700')
            }
          >
            {editMode ? '🛠 Edit' : '✏️ Edit'}
          </button>
        </div>
      </header>

      {/* Chart */}
      <section className={isCompact ? '' : 'mb-4'}>
        <Chart members={members} compact={isCompact} mode={mode} onSelect={setSelected} />
      </section>

      {/* Export / Import */}
      <ExportControls members={members} onImport={setMembers} editMode={editMode} />

      {/* Tabelle */}
      <AttendanceTable
        members={members}
        onUpdate={setMembers}
        editMode={editMode}
        mode={mode}
      />
    </div>
  )
}
