const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** "12.4k" */
export const formatCompact = (value: number) => compact.format(value).toLowerCase()

/** "49 249" */
export const formatGrouped = (value: number) => value.toLocaleString('en-US').replaceAll(',', ' ')
