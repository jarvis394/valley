import { createEditor, persistEditor } from '@valley/canvas'
import { registry } from '../../lib/registry'
import type { ProjectSummary, ValleyApi } from '../types'
import { account, emptyDocument, projects, type ProjectRecord } from './fixtures'

/**
 * In-memory backend. Created projects live until reload, and edits persist to localStorage,
 * so the server render always starts from the fixtures.
 */
const records = [...projects]

const summarize = ({ id, doc, settings, views }: ProjectRecord): ProjectSummary => ({
  id,
  title: doc.meta.title,
  date: doc.meta.date,
  thumbnail: registry.thumbnailOf(doc),
  slug: settings.slug,
  visibility: settings.visibility ?? 'private',
  files: Object.keys(doc.assets).length,
  views,
})

const byDateDesc = (a: ProjectRecord, b: ProjectRecord) =>
  b.doc.meta.date.localeCompare(a.doc.meta.date)

export const mockApi: ValleyApi = {
  getAccount: async () => account,

  listProjects: async () => records.toSorted(byDateDesc).map(summarize),

  async getProject(id) {
    const record = records.find((item) => item.id === id)
    if (!record) return null

    return {
      ...summarize(record),
      doc: record.doc,
      settings: record.settings,
      newFavorites: record.newFavorites,
    }
  },

  async createProject(files) {
    const id = crypto.randomUUID().slice(0, 8)
    const today = new Date().toISOString().slice(0, 10)
    const editor = createEditor({
      doc: emptyDocument({ title: 'Untitled project', date: today }),
      registry,
    })
    await editor.commands.insertFiles(files)
    const record = {
      id,
      doc: editor.getState().doc,
      settings: { slug: id, visibility: 'private' as const },
      views: 0,
      newFavorites: 0,
    }
    records.push(record)

    return summarize(record)
  },

  syncProject(id, editor) {
    const record = records.find((item) => item.id === id)
    const stopMirror = editor.store.subscribe(({ doc, settings }) => {
      if (record) Object.assign(record, { doc, settings })
    })
    const stopPersist = persistEditor(editor, `valley.project.${id}`)

    return () => {
      stopPersist()
      stopMirror()
    }
  },
}
