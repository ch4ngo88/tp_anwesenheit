// App.tsx
import { useState, useEffect } from 'react'
import { initialMembers } from './data/members'
import type { Member } from './types/member'
import AttendanceTable from './components/AttendanceTable'
import Chart from './components/Chart'
import logo from './assets/logo.jpg'

export default function App() {
  const [members, setMembers] = useState<Member[]>([])
  const [editMode, setEditMode] = useState(false)

  // Laden beim Start
  useEffect(() => {
    const stored = localStorage.getItem('members')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Member[]
        const valid = Array.isArray(parsed) && parsed.some(m => m?.id && m?.name)
        if (valid) {
          setMembers(parsed)
        } else {
          console.warn('[init] Ungültiger localStorage')
          setMembers(initialMembers)
        }
      } catch {
        setMembers(initialMembers)
      }
    } else {
      setMembers(initialMembers)
    }
  }, [])

  // Speichern bei Änderung
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('members', JSON.stringify(members))
      console.log('[save] gespeichert:', members)
    }
  }, [members])

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-800">
      <header className="flex items-center gap-4 mb-6 justify-between flex-wrap">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-12" />
          <h1 className="text-2xl font-bold">Anwesenheitsliste</h1>
        </div>

        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded text-white text-sm font-medium ${
            editMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {editMode ? 'Edit-Modus: AN' : 'Edit-Modus: AUS'}
        </button>
      </header>

      {/* Haupttabelle */}
      <AttendanceTable members={members} onUpdate={setMembers} editMode={editMode} />

      {/* Balkendiagramm */}
      <div className="mt-12">
        <Chart members={members} />
      </div>
    </div>
  )
}
