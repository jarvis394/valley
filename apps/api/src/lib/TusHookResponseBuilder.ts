import { BaseTusHookResponseBody, TusHookResponse } from '@valley/shared'

export class TusHookResponseBuilder<
  ResBody extends Record<string, any> = BaseTusHookResponseBody,
> {
  private readonly data: TusHookResponse
  #body: ResBody = { ok: true } as unknown as ResBody

  get body(): ResBody {
    return this.#body
  }

  constructor() {
    this.data = {
      HTTPResponse: {
        StatusCode: 200,
        Body: JSON.stringify(this.body),
        Header: {
          'Content-Type': 'application/json',
        },
      },
    }
  }

  private stringifyBody() {
    this.data.HTTPResponse.Body = JSON.stringify(this.#body)
    return this
  }

  setStatusCode(code: number) {
    this.data.HTTPResponse.StatusCode = code
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

  setRejectUpload(state: boolean) {
    this.data.RejectUpload = state
    return this
  }

  build(): TusHookResponse {
    return this.data
  }
}
