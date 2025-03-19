import localforage from 'localforage'
import { CacheAdapter } from './cache'

export class LocalForageAdapter {
  constructor() {
    localforage.config({
      name: 'valley',
      version: 1.0,
      storeName: 'cache',
    })
  }

  async getItem<T>(key: string): Promise<T | null> {
    const value = await localforage.getItem<T>(key)
    return value || null
  }

  async setItem(key: string, value: unknown) {
    const setter = localforage.setItem(key, value)
    return await setter
  }

  async removeItem(key: string) {
    return localforage.removeItem(key)
  }
}

export const cache: CacheAdapter = new LocalForageAdapter()
