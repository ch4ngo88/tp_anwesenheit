import React, { useRef } from "react";
import type { Member } from "../types/member";

interface Props {
  members: Member[];
  onImport: (members: Member[]) => void;
  editMode: boolean;
}

export default function ExportControls({ members, onImport, editMode }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(members, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "members-export.json";
      link.click();
    } catch {
      alert("❌ Fehler beim Exportieren als JSON");
    }
  };

  const exportTS = () => {
    try {
      const header = `// Auto-generiert von ExportControls.tsx
import type { Member } from '../types/member'

export const initialMembers: Member[] = `;
      const content = JSON.stringify(members, null, 2);
      const full = `${header}${content}\n`;

      const blob = new Blob([full], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "members.ts";
      link.click();
    } catch {
      alert("❌ Fehler beim Exportieren als TypeScript");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (
          Array.isArray(data) &&
          data.every((m) => m.id && m.name && "attendance" in m)
        ) {
          onImport(data);
        } else {
          alert("❌ Ungültige Datenstruktur");
        }
      } catch {
        alert("❌ Fehler beim Laden der Datei");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!editMode) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportJson}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
      >
        📤 Export JSON
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
      >
        📥 Import JSON
      </button>

      <button
        onClick={exportTS}
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
      >
        📝 Export als TypeScript
      </button>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => {
          if (
            confirm("⚠️ Lokale Änderungen wirklich löschen und zurücksetzen?")
          ) {
            localStorage.removeItem("members");
            alert(
              "✅ Lokale Daten wurden zurückgesetzt.\nInitialdaten aus members.ts werden beim nächsten Laden verwendet."
            );
            window.location.reload();
          }
        }}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
      >
        🔄 Zurücksetzen auf Datei (members.ts)
      </button>
    </div>
  );
}
