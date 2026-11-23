import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ComponentProps } from 'react'
import { cn } from '../cn'
import { focusRing, type WithClassName } from './styles'

function List({ className, ...props }: WithClassName<ComponentProps<typeof BaseTabs.List>>) {
  return (
    <BaseTabs.List className={cn('flex items-center gap-1 pr-3 pb-2 pl-2', className)} {...props} />
  )
}

function Tab({ className, ...props }: WithClassName<ComponentProps<typeof BaseTabs.Tab>>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'h-8 rounded-[10px] px-3 text-body font-medium text-fg/63 hover:text-fg data-active:bg-white/7 data-active:text-fg',
        focusRing,
        className,
      )}
      {...props}
    />
  )
}

export const Tabs = { Root: BaseTabs.Root, List, Tab, Panel: BaseTabs.Panel }
