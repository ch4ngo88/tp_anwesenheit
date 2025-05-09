import { useState, useCallback, useEffect } from 'react'
import { initialMembers } from './data/members'
import type { Member } from './types/member'
import AttendanceTable from './components/AttendanceTable'
import Chart from './components/Chart'
import ExportControls from './components/ExportControls'
import logo from './assets/logo.jpg'
import { useWindowSize } from './hooks/useWindowSize'

/* ----------  Throttle Utility  ---------- */
function throttle<T extends (...a: any[]) => void>(fn: T, delay: number): T {
  let last = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn(...args)
    }
  }) as T
}

export default function App() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [editMode, setEditMode] = useState(false)
  const { width } = useWindowSize()

  /* ----------  Mobile-Compact Logik  ---------- */
  const isCompact = width < 640 && !editMode // <sm und View-Mode

  /* ----------  Persistent Storage  ---------- */
  const save = useCallback(
    throttle((data: Member[]) => {
      try {
        localStorage.setItem('members', JSON.stringify(data))
      } catch (err) {
        console.error('[save] Fehler:', err)
      }
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
        'relative min-h-screen bg-gray-100 text-gray-800 overflow-hidden ' +
        (isCompact ? 'px-1 py-1' : 'px-2 py-3 sm:px-4 sm:py-4')
      }
    >
      {/* Header – in Compact-View als schwebende Blase unten-rechts */}
      <header
        className={
          isCompact
            ? 'fixed bottom-2 right-2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow'
            : 'flex items-center justify-between mb-3'
        }
      >
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full shadow-sm" />
          {/* Titel bleibt nur ≥xs sichtbar, im Compact-Bubble also fast immer ausgeblendet */}
          <h1 className="hidden xs:block font-semibold leading-tight text-sm">Anwesenheit</h1>
        </div>

        <button
          onClick={() => setEditMode((v) => !v)}
          className={
            'px-3 py-1.5 rounded text-white text-xs sm:text-sm font-medium ' +
            (editMode ? 'bg-red-600' : 'bg-gray-700')
          }
        >
          {editMode ? '🛠 Edit' : '✏️ Edit'}
        </button>
      </header>

      {/* Chart */}
      <section className={isCompact ? '' : 'mb-4'}>
        <Chart members={members} compact={isCompact} />
      </section>

      {/* Export / Import */}
      <ExportControls members={members} onImport={setMembers} editMode={editMode} />

      {/* Tabelle */}
      <AttendanceTable members={members} onUpdate={setMembers} editMode={editMode} />
    </div>
  )
}
