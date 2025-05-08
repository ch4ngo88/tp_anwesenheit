// data/members.ts
import type { Member } from '../types/member'

export const initialMembers: Member[] = [
  {
    id: 'm1',
    name: 'Joana',
    joined: '2023-01-01',
    attendance: [
      { date: '2025-03-09', present: true },
      { date: '2025-03-16', present: true },
      { date: '2025-03-23', present: true },
      { date: '2025-03-30', present: true },
      { date: '2025-04-06', present: true },
      { date: '2025-04-13', present: false },
      { date: '2025-04-22', present: true },
      { date: '2025-05-04', present: true },
    ],
  },
  {
    id: 'm2',
    name: 'André',
    joined: '2023-02-01',
    attendance: [
      { date: '2025-03-09', present: true },
      { date: '2025-03-16', present: false },
      { date: '2025-03-23', present: true },
      { date: '2025-03-30', present: false },
      { date: '2025-04-06', present: true },
      { date: '2025-04-13', present: true },
      { date: '2025-04-22', present: true },
      { date: '2025-05-04', present: false },
    ],
  },
  {
    id: 'm3',
    name: 'Jessica G.',
    joined: '2022-11-10',
    attendance: [
      { date: '2025-03-09', present: false },
      { date: '2025-03-16', present: false },
      { date: '2025-03-23', present: false },
      { date: '2025-03-30', present: true },
      { date: '2025-04-06', present: true },
      { date: '2025-04-13', present: false },
      { date: '2025-04-22', present: false },
      { date: '2025-05-04', present: false },
    ],
  },
  // weitere Mitglieder als Platzhalter
  
]
