import { useCallback, useState } from 'react'
import { usePageScroll } from '../usePageScroll/usePageScroll'

type UseScrollProgressProps = {
  enabled?: boolean
}

export const useScrollProgress = (
  offset: number,
  props: UseScrollProgressProps = { enabled: true }
) => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const calcScrollProgress = useCallback(
    (scrollY: number) => {
      return Math.max(Math.min(scrollY, offset), 0) / offset
    },
    [offset]
  )
  const handlePageScroll = () => {
    const newScrollProgress = calcScrollProgress(window.scrollY)
    newScrollProgress !== scrollProgress && setScrollProgress(newScrollProgress)
  }

  usePageScroll(handlePageScroll, props)

  return scrollProgress
}
