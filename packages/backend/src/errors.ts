export type BackendErrorCode = 'not-found' | 'invalid-input'

const STATUS: Record<BackendErrorCode, number> = {
  'not-found': 404,
  'invalid-input': 400,
}

export class BackendError extends Error {
  readonly status: number

  constructor(
    readonly code: BackendErrorCode,
    message: string,
  ) {
    super(message)
    this.status = STATUS[code]
  }
}
