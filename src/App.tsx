import { useState, useEffect, useCallback } from 'react'
import { initialMembers } from './data/members'
import type { Member } from './types/member'
import AttendanceTable from './components/AttendanceTable'
import Chart from './components/Chart'
import ExportControls from './components/ExportControls'
import logo from './assets/logo.jpg'

/* ---------- einfache Throttle-Utility (500 ms) ---------- */
function throttle<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
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

  const save = useCallback(
    throttle((data: Member[]) => {
      try {
        localStorage.setItem('members', JSON.stringify(data))
      } catch (err) {
        console.error('[save] Fehler beim Speichern:', err)
      }
    }, 500),
    []
  )

  useEffect(() => {
    if (members.length > 0) save(members)
  }, [members, save])

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-12 rounded-full shadow" />
          <h1 className="text-2xl font-bold">Anwesenheitsliste</h1>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded text-white text-sm font-medium transition ${
            editMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-800'
          }`}
        >
          {editMode ? '🛠 Edit-Modus: AN' : '👀 Edit-Modus: AUS'}
        </button>
      </header>

      {/* Balkendiagramm */}
      <section className="mb-8">
        <Chart members={members} />
      </section>

      {/* Export/Import */}
      <section className="mb-8">
        <ExportControls members={members} onImport={setMembers} editMode={editMode} />
      </section>

      {/* Anwesenheitstabelle */}
      <section>
        <AttendanceTable members={members} onUpdate={setMembers} editMode={editMode} />
      </section>
    </div>
  )
}
