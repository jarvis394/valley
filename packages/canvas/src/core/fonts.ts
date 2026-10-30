export interface FontDefinition {
  id: string
  label: string
  /** CSS font-family stack. */
  family: string
  /** Google Fonts `family=` query value. Omit for system / self-hosted fonts. */
  google?: string
}

/**
 * Font catalogue. Documents store only the font id, and an unknown id falls back
 * to the first font.
 */
export const FONTS: readonly FontDefinition[] = [
  {
    id: 'google-sans-flex',
    label: 'Google Sans Flex',
    family: '"Google Sans Flex", system-ui, sans-serif',
    google: 'Google+Sans+Flex:wdth,wght,ROND@100..125,300..800,0..100',
  },
  {
    id: 'geist',
    label: 'Geist',
    family: 'Geist, system-ui, sans-serif',
    google: 'Geist:wght@300..700',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter, system-ui, sans-serif',
    google: 'Inter:wght@300..700',
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    family: '"Instrument Serif", Georgia, serif',
    google: 'Instrument+Serif',
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    family: '"Space Grotesk", system-ui, sans-serif',
    google: 'Space+Grotesk:wght@400..700',
  },
  { id: 'system', label: 'System', family: 'system-ui, sans-serif' },
]

export const getFont = (id: string): FontDefinition =>
  FONTS.find((font) => font.id === id) ?? FONTS[0]!

export const googleFontsHref = (ids: Iterable<string>): string | null => {
  const families = [...new Set(ids)].map((id) => getFont(id).google).filter(Boolean)
  if (families.length === 0) return null
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap`
}
