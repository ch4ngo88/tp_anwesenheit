import { useState } from 'react'
import type { Member, AttendanceEntry } from '../types/member'

interface Props {
  members: Member[]
  onUpdate: (updatedMembers: Member[]) => void
  editMode: boolean
}

export default function AttendanceTable({ members, onUpdate, editMode }: Props) {
  const [newDate, setNewDate] = useState('')
  const [newName, setNewName] = useState('')
  const [newJoined, setNewJoined] = useState('')

  const allDates = Array.from(
    new Set(members.flatMap((m) => m.attendance.map((a) => a.date)))
  ).sort()

  const handleToggle = (memberId: string, date: string) => {
    const updated = members.map((m) => {
      if (m.id !== memberId) return { ...m }

      const existing = m.attendance.find((a) => a.date === date)
      let updatedAttendance: AttendanceEntry[]

      if (existing) {
        updatedAttendance = m.attendance.map((a) =>
          a.date === date ? { ...a, present: !a.present } : a
        )
      } else {
        updatedAttendance = [...m.attendance, { date, present: true }]
      }

      return {
        ...m,
        attendance: updatedAttendance.sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      }
    })

    onUpdate(updated)
  }

  const addNewDate = () => {
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return

    const updated = members.map((m) => {
      const alreadyExists = m.attendance.some((a) => a.date === newDate)
      if (alreadyExists) return m

      return {
        ...m,
        attendance: [...m.attendance, { date: newDate, present: false }].sort(
          (a, b) => a.date.localeCompare(b.date)
        ),
      }
    })

    onUpdate(updated)
    setNewDate('')
  }

  const addNewMember = () => {
    if (!newName.trim() || !newJoined.match(/^\d{4}-\d{2}-\d{2}$/)) return

    const newMember: Member = {
      id: 'm_' + Date.now(),
      name: newName.trim(),
      joined: newJoined,
      attendance: [],
    }

    onUpdate([...members, newMember])
    setNewName('')
    setNewJoined('')
  }

  const deleteMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id)
    onUpdate(updated)
  }

  return (
    <div className="overflow-auto bg-white shadow rounded p-4">
      {/* Mitglieder hinzufügen */}
      {editMode && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 rounded text-sm w-full sm:w-auto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded text-sm w-full sm:w-auto"
            value={newJoined}
            onChange={(e) => setNewJoined(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={addNewMember}
          >
            Mitglied hinzufügen
          </button>
        </div>
      )}

      {/* Neues Datum hinzufügen */}
      {editMode && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="date"
            className="border p-2 rounded text-sm"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={addNewDate}
          >
            Neuen Tag hinzufügen
          </button>
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 sticky top-0 z-10">
              <th className="border p-2 text-left bg-gray-100 sticky left-0 z-20">
                Mitglied
              </th>
              {allDates.map((date) => (
                <th key={date} className="border p-2 text-center bg-gray-100">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((member) => (
                <tr key={member.id}>
                  <td className="border p-2 font-medium whitespace-nowrap sticky left-0 bg-white z-10">
                    {member.name}
                    {editMode && (
                      <button
                        className="ml-2 text-xs text-red-500 hover:underline"
                        onClick={() => deleteMember(member.id)}
                      >
                        löschen
                      </button>
                    )}
                  </td>
                  {allDates.map((date) => {
                    if (date < member.joined) {
                      return (
                        <td
                          key={date}
                          className="border p-2 text-center text-gray-300"
                        >
                          —
                        </td>
                      )
                    }

                    const entry = member.attendance.find(
                      (a) => a.date === date
                    )
                    const isPresent = entry?.present ?? false

                    return (
                      <td
                        key={date}
                        className={`border p-2 text-center cursor-pointer select-none font-bold ${
                          isPresent
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                        onClick={() => handleToggle(member.id, date)}
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
    </div>
  )
}
