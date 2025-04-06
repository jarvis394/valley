import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(timezone)

export const getFormattedDate = (date?: Date, timezone: string = 'UTC') => {
  if (!date) return ''

  return dayjs(date).tz(timezone).format('DD MMMM YYYY')
}
