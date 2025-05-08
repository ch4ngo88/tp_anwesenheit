import { useState } from "react";
import type { Member, AttendanceEntry } from "../types/member";

interface Props {
  members: Member[];
  onUpdate: (updatedMembers: Member[]) => void;
  editMode: boolean;
}

export default function AttendanceTable({
  members,
  onUpdate,
  editMode,
}: Props) {
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [newJoined, setNewJoined] = useState("");

  const allDates = Array.from(
    new Set(members.flatMap((m) => m.attendance.map((a) => a.date)))
  ).sort();

  const handleToggle = (memberId: string, date: string) => {
    const updated = members.map((m) => {
      if (m.id !== memberId) return m;

      const updatedAttendance = m.attendance.some((a) => a.date === date)
        ? m.attendance.map((a) =>
            a.date === date ? { ...a, present: !a.present } : a
          )
        : [...m.attendance, { date, present: true }];

      return {
        ...m,
        attendance: updatedAttendance.sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      };
    });

    onUpdate(updated);
  };

  const addNewDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;

    const updated = members.map((m) => {
      if (m.attendance.some((a) => a.date === newDate)) return m;
      return {
        ...m,
        attendance: [
          ...m.attendance,
          { date: newDate, present: false },
        ].sort((a, b) => a.date.localeCompare(b.date)),
      };
    });

    onUpdate(updated);
    setNewDate("");
  };

  const addNewMember = () => {
    if (!newName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(newJoined)) return;

    const newMember: Member = {
      id: "m_" + Date.now(),
      name: newName.trim(),
      joined: newJoined,
      attendance: [],
    };

    onUpdate([...members, newMember]);
    setNewName("");
    setNewJoined("");
  };

  const updateMemberField = (
    id: string,
    field: "name" | "joined",
    value: string
  ) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    onUpdate(updated);
  };

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
            ➕ Mitglied hinzufügen
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
            ➕ Datum hinzufügen
          </button>
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gray-200 sticky top-0 z-10">
              <th className="border p-2 text-left bg-gray-100 sticky left-0 z-20">
                Mitglied
              </th>
              {allDates.map((date) => (
                <th
                  key={date}
                  className="border p-2 text-center bg-gray-100 relative"
                >
                  {editMode ? (
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;

                          const updated = members.map((m) => ({
                            ...m,
                            attendance: m.attendance.map((a) =>
                              a.date === date ? { ...a, date: newDate } : a
                            ),
                          }));
                          onUpdate(updated);
                        }}
                        className="text-sm border px-1 py-0.5 rounded"
                      />
                      <button
                        onClick={() => {
                          if (confirm(`Datum "${date}" wirklich löschen?`)) {
                            const updated = members.map((m) => ({
                              ...m,
                              attendance: m.attendance.filter(
                                (a) => a.date !== date
                              ),
                            }));
                            onUpdate(updated);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-lg"
                        title="Datum löschen"
                      >
                        🗑
                      </button>
                    </div>
                  ) : (
                    date
                  )}
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
                  <td className="border p-2 whitespace-nowrap sticky left-0 bg-white z-10">
                    {editMode ? (
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateMemberField(
                                member.id,
                                "name",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="date"
                            value={member.joined}
                            onChange={(e) =>
                              updateMemberField(
                                member.id,
                                "joined",
                                e.target.value
                              )
                            }
                            className="border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Mitglied "${member.name}" wirklich löschen?`
                              )
                            ) {
                              onUpdate(
                                members.filter((m) => m.id !== member.id)
                              );
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-lg mt-1"
                          title="Mitglied löschen"
                        >
                          🗑
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">
                          {member.joined}
                        </div>
                      </div>
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
                      );
                    }

                    const entry = member.attendance.find(
                      (a) => a.date === date
                    );
                    const isPresent = entry?.present ?? false;

                    return (
                      <td
                        key={date}
                        className={`border p-2 text-center select-none font-bold ${
                          isPresent
                            ? editMode
                              ? "text-green-600 cursor-pointer hover:bg-green-100"
                              : "text-green-600"
                            : editMode
                            ? "text-red-600 cursor-pointer hover:bg-red-100"
                            : "text-red-600"
                        }`}
                        onClick={() => {
                          if (editMode) handleToggle(member.id, date);
                        }}
                      >
                        {isPresent ? "✔" : "✘"}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
