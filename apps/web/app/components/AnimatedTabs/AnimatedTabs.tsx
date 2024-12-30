import Tabs, { TabsProps } from '@valley/ui/Tabs'
import React, { useCallback } from 'react'
import { HEADER_HEIGHT } from '../../config/constants'
import { map } from '../../utils/misc'
import useMediaQuery from '@valley/ui/useMediaQuery'
import { SMALL_VIEWPORT_WIDTH } from '@valley/ui/config/theme'

const TABS_OFFSET = 48

const AnimatedTabs: React.FC<TabsProps> = ({ children, ...props }) => {
  const shouldAnimate = useMediaQuery(`(min-width:${SMALL_VIEWPORT_WIDTH}px)`)
  const scrollProgressTransitionStyles = useCallback(
    (progress: number) => ({
      left: map(progress, 0, 1, 0, TABS_OFFSET),
    }),
    []
  )

  return (
    <Tabs
      {...props}
      scrollProgressOffset={HEADER_HEIGHT}
      scrollProgressTransitionStyles={
        shouldAnimate ? scrollProgressTransitionStyles : undefined
      }
    >
      {children}
    </Tabs>
  )
}

export default AnimatedTabs
