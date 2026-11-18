import { Divider, Skeleton } from '@valley/ui'

const NAV_WIDTHS = ['w-16', 'w-20', 'w-24', 'w-20']
const BLOCK_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-28', 'w-24', 'w-16']

/** The editor's panels while a project loads. The canvas stays empty. */
export function ProjectEditorSkeleton() {
  return (
    <div aria-busy className="flex h-full min-w-0 flex-1 overflow-hidden bg-canvas">
      <aside className="hidden w-80 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-12.75 shrink-0 items-center gap-3 border-b border-line px-3">
          <Skeleton className="size-7" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex shrink-0 flex-col gap-1 px-1.5 py-2">
          {NAV_WIDTHS.map((width, index) => (
            <Row key={index} width={width} />
          ))}
        </div>
        <Divider />
        <div className="flex h-11 shrink-0 items-center pl-4">
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex flex-col gap-1 px-1.5">
          {BLOCK_WIDTHS.map((width, index) => (
            <Row key={index} width={width} />
          ))}
        </div>
      </aside>

      <main className="min-w-0 flex-1" />

      <aside className="hidden w-80 shrink-0 flex-col border-l border-line bg-surface lg:flex">
        <div className="flex h-13 shrink-0 items-center justify-end gap-2 pr-3 pl-2">
          <Skeleton className="mr-auto h-8 w-12" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-18" />
        </div>
        <div className="flex shrink-0 items-center gap-1 border-b border-line pr-3 pb-2 pl-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-18" />
        </div>
      </aside>
    </div>
  )
}

function Row({ width }: { width: string }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 px-3">
      <Skeleton className="size-4" />
      <Skeleton className={`h-3 ${width}`} />
    </div>
  )
}
