export interface AttendanceEntry {
  date: string // »YYYY-MM-DD«
  present: boolean
}

export interface Member {
  id: string
  name: string
  joined: string // Eintrittsdatum »YYYY-MM-DD«
  attendance: AttendanceEntry[]
  performances: AttendanceEntry[]
}
