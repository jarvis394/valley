import cx, { ArgumentArray } from 'classnames'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ArgumentArray) => {
  return twMerge(cx(inputs))
}
