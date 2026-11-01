import { getFont } from '@valley/canvas'
import { cn } from '@valley/ui'
import { useSyncExternalStore } from 'react'

const PARTS_OF_DAY = {
  morning: 'Early for a new photoshoot?',
  afternoon: 'Ready for a new photoshoot?',
  evening: 'Late for a new photoshoot?',
} as const

const partOfDay = (hour: number) => (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening')

const subscribe = () => () => {}

/** Only the viewer's clock knows the hour, so the server renders it hidden. */
function useHour() {
  return useSyncExternalStore(
    subscribe,
    () => new Date().getHours(),
    () => null,
  )
}

export function Greeting({ name }: { name: string }) {
  const hour = useHour()
  const part = partOfDay(hour ?? 0)

  return (
    <hgroup
      className={cn(
        'flex flex-col items-center gap-2 text-center text-white transition-opacity duration-300',
        hour === null && 'opacity-0',
      )}
      style={{ fontFamily: getFont('google-sans-flex').family }}
    >
      <h1 className="text-[32px]">
        Good {part}, {name.split(' ')[0]}
      </h1>
      <p className="text-xl font-light">{PARTS_OF_DAY[part]}</p>
    </hgroup>
  )
}
