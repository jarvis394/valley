import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { Drawer } from '@base-ui/react/drawer'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Fragment, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../cn'
import { ChevronRightIcon } from '../icons'
import { ScrollArea } from './scroll-area'

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

const menuPopupClass = 'menu-surface flex min-w-60 flex-col gap-1 p-1.5 text-body font-medium'

function MenuPopup({ children, className, align = 'start', sideOffset = 6 }: PopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="z-50 outline-none" sideOffset={sideOffset} align={align}>
        <BaseMenu.Popup className={cn(menuPopupClass, className)}>{children}</BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

const ITEM_VARIANTS = {
  default: 'text-fg not-data-disabled:data-highlighted:bg-white/7',
  danger: 'text-danger not-data-disabled:data-highlighted:bg-danger/12',
} as const

const menuItemClass =
  'flex h-9 shrink-0 cursor-default items-center gap-2.5 rounded-[10px] px-3.5 outline-none select-none data-disabled:opacity-40 data-popup-open:bg-white/7'

function MenuItemIcon({ icon }: { icon: ReactNode }) {
  return <span className="-ml-0.5 flex h-4 w-3.5 shrink-0 items-center">{icon}</span>
}

function MenuItem({
  className,
  icon,
  variant = 'default',
  children,
  ...props
}: ComponentProps<typeof BaseMenu.Item> & {
  /** Leading 16px icon, in a 14px slot like `Button`'s. */
  icon?: ReactNode
  variant?: keyof typeof ITEM_VARIANTS
}) {
  return (
    <BaseMenu.Item
      className={cn(menuItemClass, ITEM_VARIANTS[variant], className as string)}
      {...props}
    >
      {icon && <MenuItemIcon icon={icon} />}
      {children}
    </BaseMenu.Item>
  )
}

/** Item that opens a nested `Menu.Popup`; wrap both in `Menu.SubmenuRoot`. */
function MenuSubmenuTrigger({
  className,
  icon,
  children,
  ...props
}: ComponentProps<typeof BaseMenu.SubmenuTrigger> & { icon?: ReactNode }) {
  return (
    <BaseMenu.SubmenuTrigger
      className={cn(menuItemClass, ITEM_VARIANTS.default, className as string)}
      {...props}
    >
      {icon && <MenuItemIcon icon={icon} />}
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronRightIcon className="-mr-0.5" />
    </BaseMenu.SubmenuTrigger>
  )
}

/** Full-bleed separator; cancels the popup's padding. */
function MenuSeparator() {
  return <BaseMenu.Separator className="-mx-1.5 my-0.5 h-px bg-white/10" />
}

/** Summary of what the menu acts on (a file), above the items. */
function MenuHeader({
  media,
  title,
  meta = [],
}: {
  /** 48px thumbnail, cropped to a square. */
  media: ReactNode
  title: ReactNode
  /** Secondary facts, joined with dots. */
  meta?: ReactNode[]
}) {
  return (
    <>
      <div className="-mx-1.5 -mt-1.5 flex items-center gap-3 pt-3 pr-2.5 pb-2.5 pl-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg border-[0.5px] border-white/4 shadow-[0_4px_8px_rgba(0,0,0,0.24),0_0_2px_rgba(0,0,0,0.24)] *:size-full *:object-cover">
          {media}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate">{title}</span>
          {meta.length > 0 && (
            <span className="flex items-center gap-1 font-normal whitespace-nowrap">
              {meta.map((item, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className="opacity-24">•</span>}
                  <span className="opacity-63">{item}</span>
                </Fragment>
              ))}
            </span>
          )}
        </div>
      </div>
      <BaseMenu.Separator className="-mx-1.5 mb-0.5 h-px bg-white/10" />
    </>
  )
}

export const Menu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Popup: MenuPopup,
  Header: MenuHeader,
  Item: MenuItem,
  SubmenuRoot: BaseMenu.SubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Separator: MenuSeparator,
}

function ContextMenuPopup({ children, className }: Pick<PopupProps, 'children' | 'className'>) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner className="z-50 outline-none">
        <BaseContextMenu.Popup className={cn(menuPopupClass, className)}>
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

/** Right-click menu. Fill its popup with `Menu` parts. */
export const ContextMenu = {
  Root: BaseContextMenu.Root,
  Trigger: BaseContextMenu.Trigger,
  Popup: ContextMenuPopup,
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

function AlertDialogPopup({
  title,
  description,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  /** Actions, right-aligned; put the confirming one last. */
  children: ReactNode
}) {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <BaseAlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <BaseAlertDialog.Popup className="popup-surface flex w-full max-w-100 flex-col gap-5 p-5 outline-none transition-[opacity,scale] duration-200 data-ending-style:scale-96 data-ending-style:opacity-0 data-starting-style:scale-96 data-starting-style:opacity-0">
          <div className="flex flex-col gap-1.5">
            <BaseAlertDialog.Title className="text-title font-medium">
              {title}
            </BaseAlertDialog.Title>
            {description && (
              <BaseAlertDialog.Description className="text-body text-fg/63">
                {description}
              </BaseAlertDialog.Description>
            )}
          </div>
          <div className="flex justify-end gap-2">{children}</div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  )
}

/** Modal that asks to confirm an action; it can't be dismissed by clicking outside. */
export const AlertDialog = {
  Root: BaseAlertDialog.Root,
  Trigger: BaseAlertDialog.Trigger,
  Close: BaseAlertDialog.Close,
  Popup: AlertDialogPopup,
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
          <Drawer.Popup className="flex max-h-[85dvh] w-full flex-col rounded-t-3xl border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)] text-white outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-400 ease-sheet data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]">
            <div className="shrink-0 pt-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <Drawer.Title className="sr-only">{title}</Drawer.Title>
            </div>
            <ScrollArea scrollbar="plain">
              <Drawer.Content>{children}</Drawer.Content>
            </ScrollArea>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
