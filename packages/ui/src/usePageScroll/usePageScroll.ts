import { useEffect } from 'react'

type UsePageScrollProps = {
  enabled?: boolean
}

export const usePageScroll = (
  callback: () => void,
  props: UsePageScrollProps = { enabled: true }
) => {
  useEffect(() => {
    callback()

    const handleScroll = () => {
      callback()
    }

    props.enabled &&
      window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [callback, props.enabled])

  return
}
