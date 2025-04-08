import dayjs from 'dayjs'
import 'dayjs/plugin/timezone'

const COVER_DATE_FORMAT = 'DD MMMM YYYY'

export const getFormattedDate = (date?: Date, timezone?: string) => {
  if (!date) return ''
  if (!timezone) return dayjs(date).format(COVER_DATE_FORMAT)
  return dayjs(date).tz(timezone).format(COVER_DATE_FORMAT)
}
