import type { BaseTusHookResponseBody, TusHookResponse } from '@valley/shared'

export class TusHookResponseBuilder<
  ResBody extends Record<string, any> = BaseTusHookResponseBody
> {
  private readonly data: TusHookResponse
  #body: ResBody = { ok: true } as unknown as ResBody

  get body(): ResBody {
    return this.#body
  }

  constructor() {
    this.data = {
      status_code: 200,
      body: JSON.stringify(this.body),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  private stringifyBody() {
    this.data.body = JSON.stringify(this.#body)
    return this
  }

  setStatusCode(code: number) {
    this.data.status_code = code
    return this
  }

  setBody(data: ResBody) {
    this.#body = data
    this.stringifyBody()
    return this
  }

  setBodyRecord(key: keyof ResBody, value: ResBody[keyof ResBody]) {
    this.#body[key] = value
    this.stringifyBody()
    return this
  }

  build(): TusHookResponse {
    return this.data
  }
}
