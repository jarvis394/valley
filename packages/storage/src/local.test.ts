import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ImmichStorage } from './immich'
import { LocalStorage } from './local'

const root = await mkdtemp(path.join(tmpdir(), 'valley-storage-'))
const text = (value: string) => new TextEncoder().encode(value)

afterAll(() => rm(root, { recursive: true, force: true }))

describe('LocalStorage', () => {
  const storage = new LocalStorage({ root, publicUrl: 'https://cdn.example/media/' })

  test('writes, reads, ranges and deletes', async () => {
    await storage.write('projects/p1/a.jpg', text('0123456789'))

    expect(await storage.head('projects/p1/a.jpg')).toMatchObject({
      size: 10,
      contentType: 'image/jpeg',
    })
    const full = await storage.read('projects/p1/a.jpg')
    expect(await new Response(full?.body).text()).toBe('0123456789')
    const part = await storage.read('projects/p1/a.jpg', { start: 2, end: 4 })
    expect(await new Response(part?.body).text()).toBe('234')
    expect(part?.size).toBe(10)

    await storage.delete('projects/p1/a.jpg')
    expect(await storage.read('projects/p1/a.jpg')).toBeNull()
  })

  test('lists keys under a prefix', async () => {
    await storage.write('list/x/1.jpg', text('1'))
    await storage.write('list/x/2.jpg', text('2'))
    await storage.write('list/y.jpg', text('3'))
    const keys = []
    for await (const object of storage.list('list/x/')) keys.push(object.key)

    expect(keys).toEqual(['list/x/1.jpg', 'list/x/2.jpg'])
  })

  test('rejects keys that escape the root', async () => {
    await expect(storage.read('../etc/passwd')).rejects.toThrow('Invalid storage key')
    await expect(storage.write('a//b', text(''))).rejects.toThrow('Invalid storage key')
  })

  test('builds public URLs with encoded segments', () => {
    expect(storage.publicUrl('a b/c.jpg')).toBe('https://cdn.example/media/a%20b/c.jpg')
  })
})

describe('ImmichStorage', () => {
  const storage = new ImmichStorage({ root, folder: 'valley' })

  test('reads anywhere but writes only to its folder', async () => {
    await new LocalStorage({ root }).write('library/admin/2024/x.jpg', text('immich'))

    expect(storage.keyPrefix).toBe('valley/')
    expect(await storage.head('library/admin/2024/x.jpg')).toMatchObject({ size: 6 })
    await expect(storage.write('library/admin/y.jpg', text(''))).rejects.toThrow('read-only')
    await expect(storage.delete('library/admin/2024/x.jpg')).rejects.toThrow('read-only')
    await storage.write('valley/projects/p/z.jpg', text('ok'))
    expect(await storage.head('valley/projects/p/z.jpg')).toMatchObject({ size: 2 })
  })
})
