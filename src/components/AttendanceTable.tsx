import { useState } from 'react'
import type { Member } from '../types/member'

interface Props {
  members: Member[]
  onUpdate: (updated: Member[]) => void
  editMode: boolean
  mode: 'training' | 'performances'
}

export default function AttendanceTable({ members, onUpdate, editMode, mode }: Props) {
  /* ───────── Nur in Edit-Mode sichtbar ───────── */
  if (!editMode) return null

  const [newDate, setNewDate] = useState('')
  const [newName, setNewName] = useState('')
  const [newJoined, setNewJoined] = useState('')

  const key = mode === 'training' ? 'attendance' : 'performances'

  const allDates = Array.from(new Set(members.flatMap((m) => m[key].map((a) => a.date)))).sort()

  /* ----------  Handler  ---------- */
  const toggle = (id: string, date: string) => {
    const upd = members.map((m) => {
      if (m.id !== id) return m
      const list = m[key]
      const att = list.some((a) => a.date === date)
        ? list.map((a) => (a.date === date ? { ...a, present: !a.present } : a))
        : [...list, { date, present: true }]
      return { ...m, [key]: att.sort((a, b) => a.date.localeCompare(b.date)) }
    })
    onUpdate(upd)
  }

  const deleteDate = (date: string) => {
    if (!confirm(`Datum "${date}" löschen?`)) return
    const upd = members.map((m) => ({
      ...m,
      attendance: m.attendance.filter((a) => a.date !== date),
    }))
    onUpdate(upd)
  }

  const addDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return
    const upd = members.map((m) => {
      const list = m[key]
      if (list.some((a) => a.date === newDate)) return m
      return {
        ...m,
        [key]: [...list, { date: newDate, present: false }].sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      }
    })
    onUpdate(upd)
    setNewDate('')
  }

  const addMember = () => {
    if (!newName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(newJoined)) return
    const newM: Member = {
      id: 'm_' + Date.now(),
      name: newName.trim(),
      joined: newJoined,
      attendance: [],
      performances: [],
    }
    onUpdate([...members, newM])
    setNewName('')
    setNewJoined('')
  }

  const updateField = (id: string, f: 'name' | 'joined', v: string) =>
    onUpdate(members.map((m) => (m.id === id ? { ...m, [f]: v } : m)))

  /* ----------  Render  ---------- */
  return (
    <div className="overflow-x-auto max-w-full bg-white shadow rounded p-3 sm:p-4">
      {/* Quick-Add  */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <input
          placeholder="Name"
          className="border p-1.5 rounded w-[120px]"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="date"
          className="border p-1.5 rounded"
          value={newJoined}
          onChange={(e) => setNewJoined(e.target.value)}
        />
        <button
          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={addMember}
        >
          ➕ Mitglied
        </button>

        <input
          type="date"
          className="border p-1.5 rounded"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <button
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addDate}
        >
          ➕ Datum
        </button>
      </div>

      {/* Tabelle  */}
      <table className="min-w-[1000px] w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-gray-200 sticky top-0 z-10">
            <th className="border p-1.5 text-left bg-gray-100 sticky left-0 z-20">Mitglied</th>
            {allDates.map((d) => (
              <th key={d} className="border p-1 text-center bg-gray-100">
                <div className="flex items-center justify-center gap-1">
                  <span>{d}</span>
                  <button onClick={() => deleteDate(d)} className="text-red-500 hover:text-red-700">
                    🗑
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {members
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((m) => (
              <tr key={m.id}>
                {/* Name + Joined */}
                <td className="border p-1.5 whitespace-nowrap sticky left-0 bg-white z-10">
                  <div className="flex items-start gap-1.5">
                    <div className="flex flex-col gap-1">
                      <input
                        value={m.name}
                        onChange={(e) => updateField(m.id, 'name', e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                      <input
                        type="date"
                        value={m.joined}
                        onChange={(e) => updateField(m.id, 'joined', e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                    </div>
                    <button
                      onClick={() =>
                        confirm(`Mitglied "${m.name}" löschen?`) &&
                        onUpdate(members.filter((x) => x.id !== m.id))
                      }
                      className="text-red-500 hover:text-red-700 text-sm mt-1"
                    >
                      🗑
                    </button>
                  </div>
                </td>

                {allDates.map((d) => {
                  if (d < m.joined)
                    return (
                      <td key={d} className="border p-1 text-center text-gray-300">
                        —
                      </td>
                    )

                  const isPresent = m[key].find((a) => a.date === d)?.present

                  return (
                    <td
                      key={d}
                      role="button"
                      aria-pressed={!!isPresent}
                      tabIndex={0}
                      onKeyDown={(e) => ['Enter', ' '].includes(e.key) && toggle(m.id, d)}
                      onClick={() => toggle(m.id, d)}
                      className={`border p-1 text-center select-none font-bold ${
                        isPresent
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {isPresent ? '✔' : '✘'}
                    </td>
                  )
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
