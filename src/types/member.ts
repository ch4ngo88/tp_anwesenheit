// types/member.ts
export interface AttendanceEntry {
    date: string // ISO
    present: boolean
  }
  
  export interface Member {
    id: string
    name: string
    joined: string // ISO
    attendance: AttendanceEntry[]
  }
  