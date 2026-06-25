import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const asDate = (d) => (d instanceof Date ? d : new Date(d))

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(value) || 0)
    .replace(/\s/g, ' ')
}

export const formatInt = (n) => new Intl.NumberFormat('pt-BR').format(Number(n) || 0)

export function formatPct(n) {
  const v = Number(n) || 0
  return (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%'
}

export const formatDateShort = (d) => format(asDate(d), 'dd/MM', { locale: ptBR })
export const formatDate = (d) => format(asDate(d), 'dd/MM/yyyy', { locale: ptBR })
export const formatDateTime = (d) => format(asDate(d), 'dd/MM/yyyy HH:mm', { locale: ptBR })
export const formatDateLong = (d) => format(asDate(d), "EEEE, d 'de' MMMM", { locale: ptBR })
export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
