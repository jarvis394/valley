import prettyBytes from 'pretty-bytes'

export const formatBytes = (n: number) => {
  return prettyBytes(n, {
    maximumFractionDigits: 2,
    space: true,
    locale: true,
    binary: false,
  })
}
