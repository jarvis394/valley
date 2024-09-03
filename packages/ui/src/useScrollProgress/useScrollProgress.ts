import { useCallback, useEffect, useState } from 'react'

type UseScrollProgressProps = {
  enabled?: boolean
}

export const useScrollProgress = (
  offset: number,
  props: UseScrollProgressProps = { enabled: true }
) => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const calcScrollProgress = useCallback((scrollY: number) => {
    return Math.min(scrollY, offset) / offset
  }, [])

  useEffect(() => {
    setScrollProgress(calcScrollProgress(window.scrollY))

    const handleScroll = () => {
      setScrollProgress(calcScrollProgress(window.scrollY))
    }

    props.enabled &&
      window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [props.enabled])

  return scrollProgress
}
