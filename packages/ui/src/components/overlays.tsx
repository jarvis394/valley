import { Drawer } from '@base-ui/react/drawer'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Popover as BasePopover } from '@base-ui/react/popover'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../cn'

/**
 * Styled Base UI overlays. Parts that need no styling are re-exported as-is,
 * so consumers keep Base UI's composition model without repeating the chrome.
 */

type PopupProps = {
  children: ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

function MenuPopup({ children, className, align = 'start', sideOffset = 6 }: PopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="z-50 outline-none" sideOffset={sideOffset} align={align}>
        <BaseMenu.Popup className={cn('popup-surface w-60 p-1 text-[13px]', className)}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

function MenuItem({
  className,
  icon,
  children,
  ...props
}: ComponentProps<typeof BaseMenu.Item> & {
  /** Leading 16px icon, muted like `ListItem`'s. */
  icon?: ReactNode
}) {
  return (
    <BaseMenu.Item
      className={cn(
        'flex cursor-default items-center gap-2.5 rounded-[10px] px-3 py-2 text-fg outline-none select-none data-highlighted:bg-white/7',
        className as string,
      )}
      {...props}
    >
      {icon && <span className="flex shrink-0 opacity-63">{icon}</span>}
      {children}
    </BaseMenu.Item>
  )
}

function MenuSeparator() {
  return <BaseMenu.Separator className="mx-2 my-1 h-px bg-white/7" />
}

export const Menu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Popup: MenuPopup,
  Item: MenuItem,
  Separator: MenuSeparator,
}

function PopoverPopup({ children, className, align = 'center', sideOffset = 6 }: PopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner className="z-50" sideOffset={sideOffset} align={align}>
        <BasePopover.Popup className={cn('popup-surface w-72 p-2', className)}>
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Close: BasePopover.Close,
  Popup: PopoverPopup,
}

/** Bottom sheet with swipe-to-dismiss (mobile panels). */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible title; visually hidden. */
  title: string
  children: ReactNode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 bg-black opacity-[calc(0.6*(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup className="max-h-[85dvh] w-full overflow-y-auto [scrollbar-gutter:stable_both-edges] overscroll-contain rounded-t-3xl border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)] text-white outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[400ms] ease-sheet data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]">
            <div className="sticky top-0 z-10 bg-surface pt-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <Drawer.Title className="sr-only">{title}</Drawer.Title>
            </div>
            <Drawer.Content>{children}</Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
