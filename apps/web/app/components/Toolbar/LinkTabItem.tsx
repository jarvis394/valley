import React from 'react'
import { ToolbarItem } from './ToolbarItem'
import TabsItem from '@valley/ui/TabsItem'
import { Link } from 'react-router'

const LinkTabItem = React.forwardRef<HTMLButtonElement, ToolbarItem>(
  function LinkTabItem({ label, value, to, ...props }, ref) {
    return (
      <TabsItem {...props} ref={ref} asChild key={value} value={value}>
        <Link prefetch="intent" discover="render" to={to || value}>
          {label}
        </Link>
      </TabsItem>
    )
  }
)

export default React.memo(LinkTabItem)
