import { LocalStorage } from './local'
import type { StorageDriverName } from './types'

export interface ImmichStorageConfig {
  /** Immich's `UPLOAD_LOCATION`, or an external library folder Immich scans. */
  root: string
  /** Subfolder Valley owns inside `root`. Everything else is read-only. */
  folder?: string
  publicUrl?: string
}

/**
 * An Immich media folder. Galleries can reference photos Immich already holds by their path
 * under `root`, and Valley's own uploads land in `folder`, which can be added to Immich as an
 * external library so they show up there too.
 */
export class ImmichStorage extends LocalStorage {
  override readonly driver: StorageDriverName = 'immich'

  constructor({ root, folder = 'valley', publicUrl }: ImmichStorageConfig) {
    const prefix = `${folder.replace(/^\/+|\/+$/g, '')}/`
    super({ root, publicUrl, keyPrefix: prefix, writablePrefixes: [prefix] })
  }
}
