import { useRef } from 'react'
import type { Member } from '../types/member'

interface Props {
  members: Member[]
  onImport: (m: Member[]) => void
  editMode: boolean
}

export default function ExportControls({ members, onImport, editMode }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  if (!editMode) return null

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(members, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), {
      href: url,
      download: 'members-export.json',
    }).click()
  }

  const exportTs = () => {
    const header =
      "// Auto-generiert von ExportControls.tsx\nimport type { Member } from '../types/member'\n\nexport const initialMembers: Member[] = "
    const blob = new Blob([header + JSON.stringify(members, null, 2) + '\n'], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), {
      href: url,
      download: 'members.ts',
    }).click()
  }

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (Array.isArray(data) && data.every((m) => m.id && m.name && m.attendance)) {
          const formatted = data.map((m: Member) => ({
            ...m,
            performances: m.performances ?? [],
          }))
          onImport(formatted)
        } else alert('❌ Ungültige Datenstruktur')
      } catch {
        alert('❌ Fehler beim Laden')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 text-sm">
      <button
        onClick={exportJson}
        className="bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700"
      >
        📤 JSON
      </button>

      <button
        onClick={() => fileInput.current?.click()}
        className="bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700"
      >
        📥 Import
      </button>

      <button
        onClick={exportTs}
        className="bg-blue-700 text-white px-3 py-1.5 rounded hover:bg-blue-800"
      >
        📝 TypeScript
      </button>

      <input type="file" accept=".json" ref={fileInput} onChange={importJson} className="hidden" />

      <button
        onClick={() => {
          if (confirm('⚠️ Lokale Änderungen wirklich löschen und zurücksetzen?')) {
            localStorage.removeItem('members')
            alert('✅ Zurückgesetzt – Seite lädt neu')
            window.location.reload()
          }
        }}
        className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
      >
        🔄 Reset
      </button>
    </div>
  )
}
