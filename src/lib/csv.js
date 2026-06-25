export function toCsv(rows, headers) {
  const cols = headers || (rows[0] ? Object.keys(rows[0]) : [])
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const head = cols.join(',')
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n')
  return rows.length ? head + '\n' + body : head
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadCsv(filename, rows, headers) {
  const csv = '﻿' + toCsv(rows, headers) // BOM para o Excel reconhecer UTF-8
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}
