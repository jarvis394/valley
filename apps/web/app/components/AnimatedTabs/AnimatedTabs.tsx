import Tabs, { TabsProps } from '@valley/ui/Tabs'
import React from 'react'
import { HEADER_HEIGHT } from '../../config/constants'
import { map } from '../../utils/misc'

const TABS_OFFSET = 48

const AnimatedTabs: React.FC<TabsProps> = ({ children, ...props }) => {
  return (
    <Tabs
      {...props}
      scrollProgressOffset={HEADER_HEIGHT}
      scrollProgressTransitionStyles={(progress) => ({
        left: map(progress, 0, 1, 0, TABS_OFFSET),
      })}
    >
      {children}
    </Tabs>
  )
}

export default AnimatedTabs
