const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Parses `YYYY-MM-DD` (or a full ISO string) without timezone drift. */
const parts = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return { year: year ?? 1970, month: (month ?? 1) - 1, day: day ?? 1 }
}

/** "2 May, 2026" */
export const formatLongDate = (iso: string) => {
  const { year, month, day } = parts(iso)
  return `${day} ${LONG_MONTHS[month]}, ${year}`
}

/** "19 Aug, 2025" */
export const formatShortDate = (iso: string) => {
  const { year, month, day } = parts(iso)
  return `${day} ${MONTHS[month]}, ${year}`
}

/** "Jul 29, 2026" */
export const formatUsDate = (iso: string) => {
  const { year, month, day } = parts(iso)
  return `${MONTHS[month]} ${day}, ${year}`
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const mb = bytes / (1024 * 1024)
  return mb < 10 ? `${mb.toFixed(1)} MB` : `${Math.round(mb)} MB`
}

/** Shortens "SnezhnyyVecher-204.jpg" to "SnezhnyyV...-204.jpg". */
export const middleTruncate = (name: string, max = 20) => {
  if (name.length <= max) return name
  const tail = Math.min(8, Math.floor((max - 3) / 2))
  return `${name.slice(0, max - 3 - tail)}...${name.slice(-tail)}`
}
