import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  default as Sortable,
  MultiDrag,
  // @ts-expect-error - @types/sortablejs doesn't have correct types
} from 'sortablejs/modular/sortable.esm.js'

dayjs.extend(calendar)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const mountMultiDragPlugin = () => {
  if (typeof window === 'undefined') {
    return
  }
  Sortable.mount(new MultiDrag())
}
mountMultiDragPlugin()
