import { mockApi } from './mock'
import type { ValleyApi } from './types'

export type * from './types'

/** The app's single data source. Point it at a backend client to leave the mock behind. */
export const api: ValleyApi = mockApi
