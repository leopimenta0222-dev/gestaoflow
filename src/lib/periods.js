import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

export const PRESETS = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'mes', label: 'Este mês' },
  { key: 'tudo', label: 'Tudo' },
]

export function rangeFor(key, now = new Date()) {
  switch (key) {
    case 'hoje':
      return { from: startOfDay(now), to: endOfDay(now) }
    case '7d':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case '30d':
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    case 'mes':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    default:
      return { from: null, to: null }
  }
}

export function inRange(iso, from, to) {
  const t = new Date(iso).getTime()
  if (from && t < from.getTime()) return false
  if (to && t > to.getTime()) return false
  return true
}

export const filterSales = (sales, from, to) => (sales || []).filter((s) => inRange(s.created_at, from, to))
