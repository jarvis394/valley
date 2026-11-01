import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import type { ComponentProps } from 'react'
import { cn } from '../cn'

function List({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn('flex items-center gap-1 pr-3 pb-2 pl-2', className as string)}
      {...props}
    />
  )
}

function Tab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'h-8 rounded-[10px] px-3 text-body font-medium text-fg/63 outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-accent/60 data-active:bg-white/7 data-active:text-fg',
        className as string,
      )}
      {...props}
    />
  )
}

export const Tabs = { Root: BaseTabs.Root, List, Tab, Panel: BaseTabs.Panel }
