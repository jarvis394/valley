declare module '@laosb/exifr' {
  interface FormatOptions {
    skip?: Filter
    pick?: Filter
    translateKeys?: boolean
    translateValues?: boolean
    reviveValues?: boolean
    parse?: boolean // XMP only
    multiSegment?: boolean // XMP and icc only
  }

  interface Options<T = Input> extends FormatOptions {
    // TIFF segment IFD blocks
    tiff?: FormatOptions | boolean
    ifd0?: FormatOptions // cannot be disabled.
    ifd1?: FormatOptions | boolean
    exif?: FormatOptions | boolean
    gps?: FormatOptions | boolean
    interop?: FormatOptions | boolean
    // notable properties in TIFF
    makerNote?: boolean
    userComment?: boolean
    // Other segments
    xmp?: FormatOptions | boolean
    icc?: FormatOptions | boolean
    iptc?: FormatOptions | boolean
    // JPEG only segment
    jfif?: FormatOptions | boolean
    // PNG only only segment
    ihdr?: FormatOptions | boolean
    // other options
    sanitize?: boolean
    mergeOutput?: boolean
    firstChunkSize?: number
    chunkSize?: number
    chunkLimit?: number
    externalReader?: (
      input: T,
      offset?: number,
      length?: number
    ) => Promise<ArrayBuffer>
  }

  type Input =
    | ArrayBuffer
    | SharedArrayBuffer
    | Buffer
    | Uint8Array
    | DataView
    | string
    | Blob
    | File
    | HTMLImageElement

  type Filter = Array<string | number>

  function parse<T = Input>(
    data: T,
    options?: Options<T> | Filter | boolean
  ): Promise<any>
}
