import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'

/** Streams an object's body into a file on disk. */
export const writeBodyToFile = (body: ReadableStream<Uint8Array>, file: string) =>
  pipeline(
    Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>),
    createWriteStream(file),
  )
